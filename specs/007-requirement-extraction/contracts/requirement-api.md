# API Contract: Requirement Router (`requirementRouter`)

**Feature**: Requirement Extraction from Job Description  
**Branch**: `007-requirement-extraction`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Overview & Routing

The `requirementRouter` is a typed tRPC v11 router mounted under `requirement` in `trpc/routers/_app.ts`. All mutation and query procedures require an authenticated session via `protectedProcedure`.

```text
appRouter
├── system
├── opportunity
├── resume
└── requirement (NEW)
    ├── extract               (Mutation: Calls AI, validates citations, returns draft)
    ├── listByOpportunityId   (Query: Fetches saved requirements for an opportunity)
    ├── save                  (Mutation: Validates & persists confirmed requirements)
    ├── delete                (Mutation: Deletes an individual requirement)
    └── getDailyUsage         (Query: Returns user's daily quota count and remaining)
```

---

## 2. Procedures

### 2.1 `requirement.extract` (Mutation)

Executes automated requirement extraction from the opportunity's stored job description.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    opportunityId: z.string().uuid(),
  })
  ```
- **Lifecycle & Security Pipeline**:
  1. Authenticate user via `ctx.session` / `ctx.actorId`.
  2. Fetch opportunity where `id === input.opportunityId` and `userId === ctx.actorId`. If not found, throw `unavailableResource()` (404 NOT_FOUND).
  3. Validate job description length: if `opportunity.jobDescription.trim().length < 50`, throw `TRPCError({ code: "BAD_REQUEST", message: "Job description must be at least 50 characters to extract requirements." })`.
  4. Check daily rate limit: query `user_daily_usage` for `ctx.actorId`, action `'requirement_extraction'`, today's date. If `count >= 5`, throw `TRPCError({ code: "TOO_MANY_REQUESTS", message: "Daily extraction limit reached (5/day). Resets at midnight UTC." })`.
  5. Call `aiExtractorService.extractRequirements({ jobDescription: opportunity.jobDescription })`.
  6. Verify citations: for each requirement, assert that `jobDescription.includes(excerpt)` (or normalized whitespace match). If invalid, discard or fail validation.
  7. Atomically increment daily quota counter in `user_daily_usage`.
  8. Return the validated draft requirements without modifying the `requirements` table.
- **Output**:
  ```typescript
  {
    draftRequirements: Array<{
      tempId: string;
      title: string;
      category: "technical_skill" | "experience" | "education" | "responsibility" | "other";
      jobDescriptionExcerpt: string;
      orderIndex: number;
    }>;
    dailyUsage: {
      used: number;
      limit: number;
      remaining: number;
    };
  }
  ```

---

### 2.2 `requirement.listByOpportunityId` (Query)

Retrieves all saved requirements for the specified opportunity.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    opportunityId: z.string().uuid(),
  })
  ```
- **Lifecycle & Security Pipeline**:
  1. Authenticate user.
  2. Verify opportunity ownership (`userId === ctx.actorId`). If not found, throw `unavailableResource()`.
  3. Fetch requirements from `requirements` table ordered by `orderIndex ASC`.
- **Output**:
  ```typescript
  Array<{
    id: string;
    opportunityId: string;
    userId: string;
    title: string;
    category: "technical_skill" | "experience" | "education" | "responsibility" | "other";
    jobDescriptionExcerpt: string;
    coverageState: "supported" | "weak" | "missing" | "unknown" | null;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
  }>
  ```

---

### 2.3 `requirement.save` (Mutation)

Replaces or persists the confirmed requirement set for the specified opportunity.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    opportunityId: z.string().uuid(),
    requirements: z.array(
      z.object({
        title: z.string().trim().min(3).max(300),
        category: z.enum(["technical_skill", "experience", "education", "responsibility", "other"]),
        jobDescriptionExcerpt: z.string().trim().min(5).max(1000),
        orderIndex: z.number().int().min(0).default(0),
      })
    ).min(1).max(30),
  })
  ```
- **Lifecycle & Security Pipeline**:
  1. Authenticate user.
  2. Verify opportunity ownership. If not found, throw `unavailableResource()`.
  3. Authoritative citation verification: For each item with an excerpt, verify that `opportunity.jobDescription` contains the excerpt. If any citation is invalid, throw `TRPCError({ code: "BAD_REQUEST", message: "One or more cited excerpts do not match the job description." })`.
  4. In a database transaction:
     - Delete existing requirements for `opportunityId`.
     - Insert the new requirements with assigned `userId`, `opportunityId`, and sequential `orderIndex`.
- **Output**:
  ```typescript
  {
    success: true;
    count: number;
  }
  ```

---

### 2.4 `requirement.delete` (Mutation)

Deletes a single saved requirement by ID.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    id: z.string().uuid(),
  })
  ```
- **Lifecycle & Security Pipeline**:
  1. Authenticate user.
  2. Query requirement by `id`. Verify ownership (`userId === ctx.actorId`). If not found, throw `unavailableResource()`.
  3. Delete the requirement row.
- **Output**:
  ```typescript
  {
    success: true;
    deletedId: string;
  }
  ```

---

### 2.5 `requirement.getDailyUsage` (Query)

Returns the authenticated user's current extraction quota state for today.

- **Access**: `protectedProcedure`
- **Input**: None / void
- **Output**:
  ```typescript
  {
    used: number;
    limit: number;
    remaining: number;
    resetsAt: string; // ISO timestamp of next midnight UTC
  }
  ```
