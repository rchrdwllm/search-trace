# Interface Contract: Opportunity tRPC API

**Router Path**: `opportunity` (composed in `trpc/routers/_app.ts` as `appRouter.opportunity`)
**Module Location**: `trpc/routers/opportunity.ts`
**Access**: All procedures require authenticated user session (`protectedProcedure`).

---

## Shared Schemas (`lib/validations/opportunity.ts` or `trpc/routers/opportunity.ts`)

```typescript
import { z } from "zod";

export const opportunityStatusEnum = z.enum([
  "draft",
  "applied",
  "interviewing",
  "rejected",
  "closed",
]);

export type OpportunityStatus = z.infer<typeof opportunityStatusEnum>;

export const createOpportunityInputSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be 100 characters or fewer"),
  role: z
    .string()
    .trim()
    .min(1, "Role title is required")
    .max(100, "Role title must be 100 characters or fewer"),
  jobDescription: z
    .string()
    .trim()
    .min(1, "Job description is required"),
  sourceUrl: z
    .string()
    .trim()
    .url("Source URL must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Source URL must use HTTPS",
    })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  status: opportunityStatusEnum.default("draft"),
});

export const updateOpportunityInputSchema = createOpportunityInputSchema.extend({
  id: z.string().min(1, "Opportunity ID is required"),
});
```

---

## Procedures

### 1. `opportunity.list`

Retrieves all opportunities owned by the authenticated user.

- **Kind**: Query
- **Procedure**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    limit: z.number().int().min(1).max(100).default(50),
  }).optional()
  ```
- **Output**:
  ```typescript
  Array<{
    id: string;
    company: string;
    role: string;
    status: OpportunityStatus;
    sourceUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastAnalysisState: "none" | "pending" | "completed";
  }>
  ```
- **Error Responses**:
  - `UNAUTHORIZED`: When caller lacks active session (`"Please sign in to continue."`).
- **Ordering**: Descending by `updatedAt` (most recently modified first).

---

### 2. `opportunity.byId`

Retrieves a single opportunity by ID, verifying user ownership.

- **Kind**: Query
- **Procedure**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    id: z.string().min(1, "Opportunity ID is required"),
  })
  ```
- **Output**:
  ```typescript
  {
    id: string;
    userId: string;
    company: string;
    role: string;
    jobDescription: string;
    sourceUrl: string | null;
    status: OpportunityStatus;
    createdAt: Date;
    updatedAt: Date;
    lastAnalysisState: "none" | "pending" | "completed";
  }
  ```
- **Error Responses**:
  - `UNAUTHORIZED`: When caller lacks active session.
  - `NOT_FOUND`: When the opportunity does not exist OR is owned by a different user.
    - Code: `"NOT_FOUND"`
    - Message: `"The requested resource is unavailable."` (non-enumeration).

---

### 3. `opportunity.create`

Creates a new opportunity record assigned to the authenticated user.

- **Kind**: Mutation
- **Procedure**: `protectedProcedure`
- **Input**: `createOpportunityInputSchema`
- **Output**:
  ```typescript
  {
    id: string;
    company: string;
    role: string;
    jobDescription: string;
    sourceUrl: string | null;
    status: OpportunityStatus;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- **Error Responses**:
  - `BAD_REQUEST`: Field-level Zod validation errors.
  - `UNAUTHORIZED`: When caller lacks active session.
  - `INTERNAL_SERVER_ERROR`: Masked safe message on unexpected database failure.

---

### 4. `opportunity.update`

Updates an existing opportunity's attributes after verifying ownership.

- **Kind**: Mutation
- **Procedure**: `protectedProcedure`
- **Input**: `updateOpportunityInputSchema`
- **Output**:
  ```typescript
  {
    id: string;
    company: string;
    role: string;
    jobDescription: string;
    sourceUrl: string | null;
    status: OpportunityStatus;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- **Error Responses**:
  - `BAD_REQUEST`: Validation failure on input fields.
  - `UNAUTHORIZED`: When caller lacks active session.
  - `NOT_FOUND`: When record is missing or owned by another user (`unavailableResource()`).

---

### 5. `opportunity.delete`

Permanently removes an opportunity after verifying ownership.

- **Kind**: Mutation
- **Procedure**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    id: z.string().min(1, "Opportunity ID is required"),
  })
  ```
- **Output**:
  ```typescript
  {
    success: true;
    id: string;
  }
  ```
- **Error Responses**:
  - `UNAUTHORIZED`: When caller lacks active session.
  - `NOT_FOUND`: When record is missing or owned by another user (`unavailableResource()`).
