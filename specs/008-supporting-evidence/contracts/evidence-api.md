# API Contract: Evidence Router (`evidenceRouter`)

**Feature**: Supporting Evidence Library and Opportunity Selection  
**Branch**: `008-supporting-evidence`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Overview & Router Mounting

The `evidenceRouter` is a typed tRPC v11 router mounted under `evidence` in `trpc/routers/_app.ts`. All mutation and query procedures require an authenticated session via `protectedProcedure`.

```text
appRouter
├── system
├── opportunity
├── resume
├── requirement
└── evidence (NEW)
    ├── list                     (Query: Fetches all personal library items)
    ├── byId                     (Query: Fetches single library item by ID)
    ├── create                   (Mutation: Creates new library item)
    ├── update                   (Mutation: Updates library item)
    ├── delete                   (Mutation: Deletes library item with cascade)
    ├── getAttachedOpportunities (Query: Returns opportunities linked to an item)
    ├── listByOpportunityId      (Query: Returns selected and available items for an opportunity)
    ├── attach                   (Mutation: Links library item to an opportunity)
    ├── detach                   (Mutation: Unlinks library item from an opportunity)
    └── createAndAttach          (Mutation: Creates item in library and links to opportunity)
```

---

## 2. Procedures & Contract Definitions

### 2.1 `evidence.list` (Query)

Fetches all evidence items owned by the authenticated user in their personal library, sorted by most recently updated.

- **Access**: `protectedProcedure`
- **Input**: None / void
- **Security Pipeline**:
  1. Authenticate user via `ctx.session` / `ctx.actorId`.
  2. Query `evidence_items` where `userId === ctx.actorId` ordered by `updatedAt DESC`.
- **Output**:
  ```typescript
  Array<{
    id: string;
    userId: string;
    title: string;
    description: string;
    type: "project" | "accomplishment" | "portfolio_link";
    sourceUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
  ```

---

### 2.2 `evidence.byId` (Query)

Fetches a specific evidence item by its unique ID.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    id: z.string().uuid("Invalid evidence item ID"),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Query `evidence_items` where `id === input.id` and `userId === ctx.actorId`.
  3. If not found or owned by another user, throw `unavailableResource()` (404 NOT_FOUND).
- **Output**: `EvidenceItem`

---

### 2.3 `evidence.create` (Mutation)

Creates a new reusable proof item in the user's personal evidence library.

- **Access**: `protectedProcedure`
- **Input**: `createEvidenceItemSchema`
  ```typescript
  z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    type: z.enum(["project", "accomplishment", "portfolio_link"]),
    sourceUrl: z.string().trim().url().refine(url => url.startsWith("https://")).max(500).optional(),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Validate input schema.
  3. Insert record into `evidence_items` with `userId = ctx.actorId`.
- **Output**: `EvidenceItem`

---

### 2.4 `evidence.update` (Mutation)

Updates an existing evidence item in the user's personal library.

- **Access**: `protectedProcedure`
- **Input**: `updateEvidenceItemSchema`
  ```typescript
  z.object({
    id: z.string().uuid("Invalid evidence item ID"),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    type: z.enum(["project", "accomplishment", "portfolio_link"]),
    sourceUrl: z.string().trim().url().refine(url => url.startsWith("https://")).max(500).optional(),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify item exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  3. Update fields and set `updatedAt = new Date()`.
- **Output**: `EvidenceItem`

---

### 2.5 `evidence.delete` (Mutation)

Permanently deletes an evidence item from the user's library and cascades removal across all opportunity selections.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    id: z.string().uuid("Invalid evidence item ID"),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify item exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  3. Delete from `evidence_items` where `id === input.id` and `userId === ctx.actorId`. (Postgres cascades deletion to `opportunity_evidence`).
- **Output**:
  ```typescript
  {
    success: true;
    id: string;
  }
  ```

---

### 2.6 `evidence.getAttachedOpportunities` (Query)

Returns the list of opportunities to which this evidence item is currently attached, allowing the UI to show an explicit warning dialog before deletion.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    id: z.string().uuid("Invalid evidence item ID"),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify evidence item exists and is owned by `ctx.actorId`. If not, throw `unavailableResource()`.
  3. Join `opportunity_evidence` with `opportunities` where `evidenceItemId === input.id` and `opportunities.userId === ctx.actorId`.
- **Output**:
  ```typescript
  Array<{
    opportunityId: string;
    company: string;
    role: string;
  }>
  ```

---

### 2.7 `evidence.listByOpportunityId` (Query)

Fetches evidence items for an opportunity workspace, partitioning them into items currently selected for this opportunity and remaining unselected items available in the user's library.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    opportunityId: z.string().uuid("Invalid opportunity ID"),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify opportunity exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  3. Query `opportunity_evidence` joined with `evidence_items` for `opportunityId` -> `selected`.
  4. Query `evidence_items` where `userId === ctx.actorId` excluding `selected` IDs -> `available`.
- **Output**:
  ```typescript
  {
    selected: EvidenceItem[];
    available: EvidenceItem[];
  }
  ```

---

### 2.8 `evidence.attach` (Mutation)

Attaches an existing library evidence item to a specific opportunity.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    opportunityId: z.string().uuid("Invalid opportunity ID"),
    evidenceItemId: z.string().uuid("Invalid evidence item ID"),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify opportunity exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  3. Verify evidence item exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  4. Insert into `opportunity_evidence` with `(opportunityId, evidenceItemId, userId)`. On conflict `(opportunityId, evidenceItemId)` do nothing (idempotent).
- **Output**:
  ```typescript
  {
    success: true;
  }
  ```

---

### 2.9 `evidence.detach` (Mutation)

Detaches an evidence item from an opportunity without removing it from the user's library.

- **Access**: `protectedProcedure`
- **Input**:
  ```typescript
  z.object({
    opportunityId: z.string().uuid("Invalid opportunity ID"),
    evidenceItemId: z.string().uuid("Invalid evidence item ID"),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify opportunity exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  3. Delete from `opportunity_evidence` where `opportunityId === input.opportunityId`, `evidenceItemId === input.evidenceItemId`, and `userId === ctx.actorId`.
- **Output**:
  ```typescript
  {
    success: true;
  }
  ```

---

### 2.10 `evidence.createAndAttach` (Mutation)

Creates a new evidence item in the user's personal library and immediately attaches it to the specified opportunity in a single transactional or sequential operation.

- **Access**: `protectedProcedure`
- **Input**: `createAndAttachEvidenceInputSchema`
  ```typescript
  z.object({
    opportunityId: z.string().uuid("Invalid opportunity ID"),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    type: z.enum(["project", "accomplishment", "portfolio_link"]),
    sourceUrl: z.string().trim().url().refine(url => url.startsWith("https://")).max(500).optional(),
  })
  ```
- **Security Pipeline**:
  1. Authenticate user via `ctx.actorId`.
  2. Verify opportunity exists and `userId === ctx.actorId`. If not, throw `unavailableResource()`.
  3. Insert record into `evidence_items` with `userId = ctx.actorId`.
  4. Insert record into `opportunity_evidence` with `opportunityId`, `evidenceItemId`, and `userId`.
- **Output**:
  ```typescript
  {
    success: true;
    evidenceItem: EvidenceItem;
  }
  ```
