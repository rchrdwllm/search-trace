# Phase 0: Technical Research & Architectural Decisions

**Feature**: Supporting Evidence Library and Opportunity Selection  
**Branch**: `008-supporting-evidence`  
**Date**: 2026-09-08  
**Spec**: [spec.md](./spec.md)

---

## Decision 1: Relational Data Model for Supporting Evidence

- **Decision**: Introduce two distinct Drizzle tables in `lib/db/schema.ts`:
  1. `evidence_items`: User-scoped reusable library of proof records (`project`, `accomplishment`, `portfolio_link`).
  2. `opportunity_evidence`: User-scoped join table linking opportunities to evidence items with a unique composite constraint `(opportunity_id, evidence_item_id)`.
- **Rationale**:
  Directly implements PRD User Story 4 and Section 4. A single proof artifact can be reused across zero, one, or multiple opportunities without duplicating its underlying content. Scoping both entities with foreign keys to `user.id` guarantees that all records remain strictly owned and isolated.
- **Alternatives Considered**:
  - *Storing an array of evidence item IDs inside the `opportunities` table*: Rejected because it undermines relational integrity, prevents indexing on relations, complicates joins, and makes foreign key cascades impossible in PostgreSQL.
  - *Scoping evidence items strictly to individual opportunities*: Rejected because PRD User Story 4 explicitly requires users to maintain evidence once in a personal library and reuse it across multiple opportunities.

---

## Decision 2: Strict Dual-Ownership Verification on Association

- **Decision**: In `evidenceRouter.attach`, `evidenceRouter.detach`, and `evidenceRouter.createAndAttach`, the server strictly verifies that `ctx.actorId` owns **both** the target `opportunity` and the specified `evidenceItem`.
- **Rationale**:
  In accordance with Constitution Principle III (Privacy, Isolation, and Explicit Consent) and PRD Section 4, a user must never be allowed to attach another user's evidence item to their own opportunity, or attach their own evidence item to an opportunity owned by another user. If either record does not exist or belongs to another user, the procedure throws `unavailableResource()` (404 NOT_FOUND), completely eliminating resource enumeration.
- **Alternatives Considered**:
  - *Verifying only opportunity ownership*: Rejected because it introduces an IDOR (Insecure Direct Object Reference) vulnerability, permitting users to associate foreign evidence IDs with their own opportunities.

---

## Decision 3: URL Format & Strict HTTPS Protocol Enforcement

- **Decision**: Validate the optional `sourceUrl` field using Zod in `lib/validations/evidence.ts`. URLs must parse as valid web URLs and start strictly with `https://`. The system will not perform outbound network requests, DNS queries, or live HTTP status checks.
- **Rationale**:
  Restricting links to HTTPS protects against dangerous protocols (e.g., `javascript:`, `data:`, `file:`) and ensures secure navigation. Skipping automated URL checking strictly adheres to the PRD non-goal that prohibits web scraping, URL crawling, or background inspections.
- **Alternatives Considered**:
  - *Allowing HTTP URLs*: Rejected for transport security and to maintain clean portfolio presentation.
  - *Head-checking URLs via server-side fetch*: Rejected because external network latency, flakiness, or rate limits would degrade user experience and violate the PRD MVP non-goals.

---

## Decision 4: Evidence Library Navigation and UI Structure

- **Decision**:
  1. Implement a dedicated personal library view at `/dashboard/evidence/page.tsx` for creating, reviewing, editing, and deleting evidence items independently of any job opportunity.
  2. Enable the "Evidence Library" item in `components/app-shared.tsx` and sidebar navigation (replacing the placeholder disabled "Evidence workspace" entry).
  3. Embed an `OpportunityEvidenceSection` on the opportunity detail page (`/dashboard/opportunities/[opportunityId]/page.tsx`), showing currently selected evidence items, an "Attach Evidence" dialog to pick unselected items from the user's library, and a "New Evidence" modal that creates and immediately attaches an item.
- **Rationale**:
  Fulfills User Story 1 (manage evidence independently), User Story 2 (attach/detach per opportunity), and User Story 3 (create contextual proof without leaving the opportunity view).
- **Alternatives Considered**:
  - *Managing evidence solely within the opportunity view*: Rejected because users would have no way to manage evidence before creating an opportunity.
  - *Managing evidence solely in the library view*: Rejected because forcing users to leave an opportunity to add or attach evidence creates friction during application tailoring.

---

## Decision 5: Cascade Deletion Warning and Orphan Prevention

- **Decision**:
  - Database level: Foreign key on `opportunity_evidence.evidenceItemId` has `onDelete: "cascade"`. Deleting an evidence item automatically cleans up join records without leaving orphaned associations.
  - Database level: Foreign key on `opportunity_evidence.opportunityId` has `onDelete: "cascade"`. Deleting an opportunity cleans up join records while preserving underlying evidence items in the user's library.
  - UI level: Before an evidence item is deleted from the library, the client checks attachment associations. If attached to one or more opportunities, the delete dialog warns the user and lists the affected opportunities before confirming permanent removal.
- **Rationale**:
  Satisfies User Story 4 (warning users before removing evidence from active opportunities) while ensuring database-level integrity and zero orphaned join records.
- **Alternatives Considered**:
  - *Blocking deletion if attached*: Rejected because PRD User Story 4 explicitly states: "Deleting an evidence item removes its opportunity selections and excludes it from future analyses after confirmation."
  - *Silent deletion without warning*: Rejected because users could unintentionally break context in active job applications without realizing an item was linked.

---

## Decision 6: Offline-Resilient Quality Gate & Testing

- **Decision**: Test suites in `tests/008-supporting-evidence/` will enforce complete isolation using unit mocks and in-memory PGlite fixtures. No external network requests, database connections, or credentials will be required to run `bun run check`.
- **Rationale**:
  Mandated by Constitution Principle V and the SearchTrace repository architecture manual (`AGENTS.md`).
- **Alternatives Considered**:
  - *Running tests against a live Supabase instance*: Rejected because automated CI and local developer gates must remain 100% offline-capable and zero-credential.
