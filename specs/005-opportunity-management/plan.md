# Implementation Plan: Opportunity Management

**Branch**: `005-opportunity-management` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-opportunity-management/spec.md` (Story 2 — "Capture one opportunity" from `docs/prd/prd.md`).

---

## Summary

Implement opportunity lifecycle management allowing signed-in job seekers to create, list, view, edit, and delete job opportunities. The feature introduces a typed `opportunities` table in Drizzle ORM scoped to the authenticated user, an `opportunityRouter` in tRPC v11 with 5 protected procedures (`list`, `byId`, `create`, `update`, `delete`), and responsive, accessible UI pages under `/dashboard` using App Router and Tailwind CSS. The design strictly enforces privacy, owner isolation, non-enumeration via `unavailableResource()`, and plain text rendering, while explicitly excluding PRD non-goals (no scraping, ATS scoring, timelines, or cross-opportunity analytics).

---

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2.8, Next.js 16.3.4 (App Router), Bun 1.4.2

**Primary Dependencies**: tRPC v11, SuperJSON, TanStack React Query v5, Zod 4.1.12, Better Auth 1.7.3, Drizzle ORM 0.45.2, Lucide React, Radix UI primitives, Tailwind CSS v4

**Storage**: Supabase-hosted Postgres accessed through server-only Drizzle ORM. The new `opportunities` table resides in the `public` schema with a cascading foreign key referencing `user.id` and indexes on `(user_id)` and `(user_id, updated_at DESC)`.

**Testing**: Jest 30 with `--experimental-vm-modules`, React Testing Library, `jest-axe`, PGlite in-memory database test harness, and strict static boundary assertions.

**Target Platform**: Node.js 20+ serverless hosting (Vercel) and modern evergreen browsers across responsive widths (320px to 1440px).

**Project Type**: Full-stack Next.js App Router application.

**Performance Goals**: Opportunity mutations complete in under 300ms server processing time; dashboard renders up to 50 saved opportunities with 0 cumulative layout shift and zero horizontal overflow.

**Constraints**:
- Single-opportunity scope: One opportunity at a time; no CRM funnel tracking, multi-application dashboards, or cross-opportunity analytics.
- Privacy & Non-enumeration: Non-owner or nonexistent opportunity queries return an indistinguishable `NOT_FOUND` response via `unavailableResource()`.
- Data Safety: Plain-text rendering of job descriptions with whitespace preservation to prevent XSS; HTTPS scheme enforcement on source URLs.
- Logging: Operational logs never contain raw job descriptions or sensitive user content.

**Scale/Scope**: 5 tRPC procedures, 1 Drizzle table, 4 Next.js dashboard routes, accessible opportunity components, and a dedicated test suite in `tests/005-opportunity-management/`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Constitutional Concern | Plan Response | Status |
|---|---|:---:|
| **I. Evidence Before Inference** | Opportunity stores verbatim pasted job descriptions and optional HTTPS URLs without web scraping, crawling, or AI modification. | Pass |
| **II. Human Review and Control** | User directly creates, edits, and deletes records. Deletion requires explicit user confirmation via an accessible dialog. | Pass |
| **III. Privacy, Isolation, and Explicit Consent** | All table rows are user-scoped (`user_id`). Every tRPC procedure verifies `ctx.actorId`. Foreign/missing resources return `unavailableResource()` (non-enumeration). Operational logs never record job descriptions. | Pass |
| **IV. Bounded and Honest AI** | AI analysis is deferred to Story 5. No ATS scoring, hiring probabilities, or causality inferences are introduced. | Pass |
| **V. Lean, Testable Delivery** | Strictly bounded to Story 2; no non-goals (timelines, scrapers, analytics). Tests partitioned into `tests/005-opportunity-management/`. Full compliance with Next.js 16 conventions. | Pass |

**Post-design review: PASS.**
Design artifacts (`data-model.md`, `contracts/opportunity-api.md`, `contracts/opportunity-ui.md`, `quickstart.md`) strictly adhere to constitutional rules, data boundaries, and accessibility standards.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-opportunity-management/
├── spec.md                                  # Feature specification
├── plan.md                                  # Implementation plan (this file)
├── research.md                              # Phase 0 decisions and rationale
├── data-model.md                            # Entity and database model
├── quickstart.md                            # Runnable verification walkthrough
├── contracts/
│   ├── opportunity-api.md                   # tRPC API contracts
│   └── opportunity-ui.md                    # UI component and page contracts
├── checklists/
│   └── requirements.md                      # Spec quality checklist
└── tasks.md                                 # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
lib/
├── db/
│   └── schema.ts                            # [MODIFY] Add opportunities table and relations
└── validations/
    └── opportunity.ts                       # [NEW] Shared Zod schemas for opportunities

trpc/routers/
├── _app.ts                                  # [MODIFY] Register opportunityRouter
└── opportunity.ts                           # [NEW] Domain tRPC router for opportunity CRUD

app/dashboard/
├── page.tsx                                 # [MODIFY] Dashboard view with opportunities list & empty state
└── opportunities/
    ├── new/
    │   └── page.tsx                         # [NEW] Opportunity creation page
    └── [opportunityId]/
        ├── page.tsx                         # [NEW] Opportunity detail view
        └── edit/
            └── page.tsx                     # [NEW] Opportunity edit page

components/
├── opportunities/
│   ├── opportunity-card.tsx                 # [NEW] Dashboard opportunity list item
│   ├── opportunity-form.tsx                 # [NEW] Shared create/edit form component
│   ├── opportunity-delete-dialog.tsx        # [NEW] Accessible deletion confirmation modal
│   └── opportunity-status-badge.tsx         # [NEW] Status badge component
└── ui/
    └── textarea.tsx                         # [NEW] Accessible styled textarea primitive

drizzle/
├── 0001_add_opportunities.sql               # [NEW] Generated migration SQL
└── meta/                                    # [MODIFY] Updated Drizzle snapshot

tests/005-opportunity-management/
├── boundaries/
│   └── opportunity-boundary.test.ts         # [NEW] Static boundary & server-only import checks
├── components/
│   ├── opportunity-forms.test.ts            # [NEW] Form validation & interaction tests
│   └── opportunity-list.test.ts             # [NEW] Dashboard list & empty state tests
├── db/
│   └── schema.test.ts                       # [NEW] Opportunities table & index assertions
└── procedures/
    └── opportunity-router.test.ts           # [NEW] tRPC procedure contracts & ownership checks
```

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations. Design strictly adheres to all core principles.*
