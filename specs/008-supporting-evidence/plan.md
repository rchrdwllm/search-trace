# Implementation Plan: Supporting Evidence Library and Opportunity Selection

**Branch**: `008-supporting-evidence` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-supporting-evidence/spec.md` (Story 4 — "Maintain and reuse supporting evidence" from `docs/prd/prd.md`).

---

## Summary

Implement the reusable Supporting Evidence system, enabling job seekers to catalog verifiable proof of their experience (`project`, `accomplishment`, `portfolio_link`) once in a personal library and selectively attach relevant proof items to individual job opportunities. The architecture features:

1. **Schema & Relational Persistence**:
   - `evidence_items`: User-scoped library of reusable proof records with title (1–120 chars), description (1–2,000 chars), category type, and optional validated `https:` link.
   - `opportunity_evidence`: User-scoped many-to-many join entity linking opportunities to evidence items with a unique composite constraint `(opportunity_id, evidence_item_id)`.
   - Migration `0004_add_evidence_tables.sql` managing database schema evolution in Drizzle ORM with cascading foreign keys to `user.id` and `opportunities.id`.
2. **Dual-Ownership Authorization & Non-Enumeration**:
   - Server-side verification enforcing that `ctx.actorId` owns both the opportunity and the evidence item before associating them.
   - All unauthorized cross-user operations return `unavailableResource()` (404 NOT_FOUND) to prevent resource existence leakage.
3. **Strict Validation & Non-Goal Boundaries**:
   - Zod validation enforcing length bounds and strict `https://` protocol requirements for links.
   - Adherence to PRD non-goals: no automated external web crawling, scraping, or live URL checks; no AI recommendations or pre-mapping to requirements.
4. **tRPC Evidence Router**:
   - Mounts `evidenceRouter` in `trpc/routers/evidence.ts` with 10 protected procedures covering library CRUD (`list`, `byId`, `create`, `update`, `delete`), opportunity associations (`listByOpportunityId`, `attach`, `detach`, `createAndAttach`), and association inspection (`getAttachedOpportunities`).
5. **Interactive & Accessible UI Workspace**:
   - Dedicated library management view at `/dashboard/evidence/page.tsx` with category filter tabs and deletion warning dialogs.
   - Sidebar navigation integration enabling "Evidence Library" in `components/app-shared.tsx`.
   - Embedded `OpportunityEvidenceSection` on the opportunity detail page (`/dashboard/opportunities/[opportunityId]/page.tsx`), allowing immediate selection of available library items and in-context creation of new proof items.
6. **Offline Test Resilience**:
   - Comprehensive test suite in `tests/008-supporting-evidence/` covering static boundaries, router contracts, ownership checks, cascading deletions, and component accessibility using unit mocks and PGlite.

---

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2.8, Next.js 16.3.4 (App Router), Bun 1.4.2

**Primary Dependencies**: tRPC v11, SuperJSON, TanStack React Query v5, Zod 4.1.12, Better Auth 1.7.3, Drizzle ORM 0.45.2, Lucide React, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`), Tailwind CSS v4

**Storage**: PostgreSQL hosted on Supabase; `evidence_items` and `opportunity_evidence` tables managed via server-only Drizzle connections, with cascading foreign keys to `opportunities.id` and `user.id`. PGlite in-memory database harness for offline test execution.

**Testing**: Jest 30 with `--experimental-vm-modules`, React Testing Library, `jest-axe`, PGlite in-memory database test harness, and static boundary assertions.

**Target Platform**: Node.js 20+ serverless hosting (Vercel) and modern evergreen browsers across responsive widths (320px to 1440px).

**Project Type**: Full-stack Next.js App Router application.

**Performance Goals**:
- Library query procedures (`evidence.list`, `evidence.byId`) execute in under 50ms.
- Opportunity attachment and detachment mutations execute in under 100ms.
- Client-side selection toggles reflect immediately with optimistic state updates.
- Modal interactions and accessible dialog focus trapping render without visual lag.

**Constraints**:
- **Dual-Ownership Verification**: Attaching an evidence item requires verified ownership of both the opportunity and the evidence item (Constitution Principle III).
- **Non-Enumeration**: Queries and mutations targeting foreign records return `unavailableResource()` (404 NOT_FOUND).
- **Strict HTTPS URLs**: Links must parse as valid URLs and begin with `https://`. No external crawling or scraping (PRD MVP non-goals).
- **Safe Plain Text**: All evidence titles and descriptions rendered strictly as plain text (`whitespace-pre-wrap`, `break-words`).
- **Cascade Cleanup**: Deleting an evidence item cleanly detaches it from all opportunities after user confirmation, leaving zero orphaned join rows.

**Scale/Scope**: 1 Drizzle migration, 2 database tables, 10 tRPC procedures, 7 UI components, 1 standalone page, 1 embedded section, and a dedicated test suite in `tests/008-supporting-evidence/`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Constitutional Concern | Plan Response | Status |
|---|---|:---:|
| **I. Evidence Before Inference** | Evidence items catalog verifiable facts (projects, accomplishments, portfolio links) maintained by the user, providing the factual foundation for gap analysis without inventing claims. | Pass |
| **II. Human Review and Control** | Users maintain full unilateral control to create, edit, delete, attach, and detach evidence items per opportunity. No automated AI modification or forced mappings. | Pass |
| **III. Privacy, Isolation, and Explicit Consent** | All evidence and opportunity associations are strictly scoped to `ctx.actorId` (`userId` FK). Cross-user operations return generic 404 `unavailableResource()`. Server logs exclude private URLs and text. | Pass |
| **IV. Bounded and Honest AI** | AI does not automatically fetch, inspect, crawl, or recommend evidence items. Only evidence explicitly attached by the user is authorized for future analysis requests. | Pass |
| **V. Lean, Testable Delivery** | Bounded strictly to User Story 4. Test directory in `tests/008-supporting-evidence/`. Offline quality gate supported via unit mocks and PGlite. | Pass |

**Post-design review: PASS.**  
All design artifacts (`research.md`, `data-model.md`, `contracts/evidence-api.md`, `contracts/evidence-ui.md`, `quickstart.md`) strictly satisfy constitutional principles and PRD specifications.

---

## Project Structure

### Documentation (this feature)

```text
specs/008-supporting-evidence/
├── spec.md                                  # Feature specification
├── plan.md                                  # Implementation plan (this file)
├── research.md                              # Phase 0 architectural decisions
├── data-model.md                            # Entity specifications and relational schemas
├── quickstart.md                            # Runnable verification walkthrough
├── contracts/
│   ├── evidence-api.md                      # tRPC router procedures & Zod contracts
│   └── evidence-ui.md                       # Component hierarchy & accessibility contracts
├── checklists/
│   └── requirements.md                      # Spec quality checklist
└── tasks.md                                 # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
lib/
├── db/
│   └── schema.ts                            # [MODIFY] Add evidenceItems and opportunityEvidence tables
└── validations/
    └── evidence.ts                          # [NEW] Zod schemas for evidence items and association inputs

trpc/routers/
├── _app.ts                                  # [MODIFY] Mount evidenceRouter
└── evidence.ts                              # [NEW] Domain router (list, byId, create, update, delete, attach, detach, createAndAttach, getAttachedOpportunities, listByOpportunityId)

components/
├── app-shared.tsx                           # [MODIFY] Enable "Evidence Library" navigation item
└── evidence/
    ├── evidence-card.tsx                    # [NEW] Evidence item card with category badge and action controls
    ├── evidence-form-dialog.tsx             # [NEW] Modal dialog to create/edit an evidence item
    ├── evidence-delete-dialog.tsx           # [NEW] Confirmation dialog with opportunity cascade warning
    ├── evidence-type-badge.tsx              # [NEW] Accessible category badge (project, accomplishment, link)
    ├── evidence-empty-state.tsx             # [NEW] Empty state prompt with create CTA
    ├── evidence-picker-dialog.tsx           # [NEW] Modal dialog to select and attach library items
    └── opportunity-evidence-section.tsx     # [NEW] Embedded section in opportunity detail view

app/
└── dashboard/
    ├── evidence/
    │   └── page.tsx                         # [NEW] Standalone Personal Evidence Library view
    └── opportunities/
        └── [opportunityId]/
            └── page.tsx                     # [MODIFY] Embed OpportunityEvidenceSection below RequirementSection

drizzle/
├── 0004_add_evidence_tables.sql            # [NEW] Generated migration SQL
└── meta/                                    # [MODIFY] Updated Drizzle migration snapshots

tests/008-supporting-evidence/
├── boundaries/
│   └── evidence-boundary.test.ts            # [NEW] Static boundaries & server-only import assertions
├── procedures/
│   └── evidence-router.test.ts              # [NEW] Procedure contracts, dual-ownership, & cascade deletion tests
└── components/
    ├── evidence-views.test.tsx              # [NEW] Library view, modal interactions, & accessibility axe tests
    └── opportunity-evidence.test.tsx        # [NEW] Attachment toggling and contextual creation tests
```

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations. Design strictly adheres to all core principles and MVP constraints.*
