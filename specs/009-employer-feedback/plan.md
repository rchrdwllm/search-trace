# Implementation Plan: Opportunity Employer Feedback and Provenance Preservation

**Branch**: `009-employer-feedback` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-employer-feedback/spec.md` (Story 5 — "Preserve employer feedback" from `docs/prd/prd.md`).

---

## Summary

Implement the Opportunity Employer Feedback module, allowing job seekers to record quoted or summarized employer feedback for specific job opportunities, maintain explicit provenance classifications, control per-item AI inclusion (default off), and present signals honestly without causal claims. The architecture features:

1. **Schema & Relational Persistence**:
   - `feedback_items`: Opportunity-scoped table in Drizzle ORM (`lib/db/schema.ts`) with columns for `opportunityId`, `userId`, `feedbackDate`, `text` (1–5,000 chars), `sourceType` (`recruiter_feedback`, `rejection_note`, `interview_feedback`, `user_summary`), `provenance` (`exact_quote`, `personal_summary`), and `aiOptIn` (boolean, default `false`).
   - Migration `0005_add_feedback_items_table.sql` with foreign keys cascading to `opportunities.id` and `user.id`.
2. **Owner Authorization & Non-Enumeration**:
   - Dual verification enforcing that `ctx.actorId` owns both the target opportunity and the feedback item.
   - All unauthorized cross-user operations return `unavailableResource()` (404 NOT_FOUND) to eliminate resource enumeration.
3. **Strict Validation & Non-Goal Boundaries**:
   - Zod validation schemas in `lib/validations/feedback.ts` enforcing date formats, text bounds (1–5,000 chars), and strict enum matching.
   - Adherence to PRD non-goals: no automated email scraping, header extraction, or causal rejection inferences.
4. **tRPC Feedback Router**:
   - Mounts `feedbackRouter` in `trpc/routers/feedback.ts` with 6 protected procedures (`listByOpportunityId`, `byId`, `create`, `update`, `setAiOptIn`, `delete`).
5. **Interactive & Accessible UI Workspace**:
   - Embedded `OpportunityFeedbackSection` on the opportunity detail page (`/dashboard/opportunities/[opportunityId]/page.tsx`).
   - Cards displaying source badges, provenance badges (`Exact Quote` / `Personal Summary`), and inline AI opt-in switches.
   - Dialog forms with clear privacy guidance against entering recruiter contact details, signatures, or email headers.
   - Non-causality disclaimer prominently framing feedback as a reported observation rather than proof of a rejection cause.
6. **Offline Test Resilience**:
   - Comprehensive test suite in `tests/009-employer-feedback/` covering static boundaries, router contracts, ownership checks, cascading deletions, and component accessibility using unit mocks and PGlite.

---

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2.8, Next.js 16.3.4 (App Router), Bun 1.4.2

**Primary Dependencies**: tRPC v11, SuperJSON, TanStack React Query v5, Zod 4.1.12, Better Auth 1.7.3, Drizzle ORM 0.45.2, Lucide React, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-switch`), Tailwind CSS v4

**Storage**: PostgreSQL hosted on Supabase; `feedback_items` table managed via server-only Drizzle connections, with cascading foreign keys to `opportunities.id` and `user.id`. PGlite in-memory database harness for offline test execution.

**Testing**: Jest 30 with `--experimental-vm-modules`, React Testing Library, `jest-axe`, PGlite in-memory database test harness, and static boundary assertions.

**Target Platform**: Node.js 20+ serverless hosting (Vercel) and modern evergreen browsers across responsive widths (320px to 1440px).

**Project Type**: Full-stack Next.js App Router application.

**Performance Goals**:
- Query procedure (`feedback.listByOpportunityId`) executes in under 50ms.
- Mutation procedures (`create`, `update`, `setAiOptIn`, `delete`) execute in under 100ms.
- Client-side AI opt-in switch reflects immediately with optimistic state updates.
- Modal interactions and accessible dialog focus trapping render without visual lag.

**Constraints**:
- **Ownership Verification**: Accessing or mutating feedback requires verified ownership of both the opportunity and the feedback item (Constitution Principle III).
- **Non-Enumeration**: Queries and mutations targeting foreign records return `unavailableResource()` (404 NOT_FOUND).
- **Default-Off AI Opt-In**: AI inclusion flag must strictly default to `false` for every newly created feedback item.
- **Safe Plain Text**: All feedback text rendered strictly as plain text (`whitespace-pre-wrap`, `break-words`).
- **Cascade Cleanup**: Deleting an opportunity automatically cascades deletion to all associated feedback items.
- **Non-Causality**: UI must explicitly disclaim that feedback is a reported signal, never proven rejection causality.

**Scale/Scope**: 1 Drizzle migration, 1 database table, 6 tRPC procedures, 6 UI components, 1 embedded section in the opportunity view, and a dedicated test suite in `tests/009-employer-feedback/`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Constitutional Concern | Plan Response | Status |
|---|---|:---:|
| **I. Evidence Before Inference** | Feedback preserves user-supplied employer communications with strict provenance distinctions (`exact_quote` vs. `personal_summary`), visibly separating quotes from summaries. | Pass |
| **II. Human Review and Control** | Users maintain complete control to create, edit, delete, and toggle AI opt-in for feedback items. No automated AI alteration of user records. | Pass |
| **III. Privacy, Isolation, and Explicit Consent** | All feedback records are scoped to `ctx.actorId` (`userId` FK). AI inclusion defaults strictly to `false`. Cross-user operations return generic 404 `unavailableResource()`. Server logs exclude feedback text. | Pass |
| **IV. Bounded and Honest AI** | Feedback is framed strictly as a "Reported Signal". System explicitly forbids inferring rejection causes, calculating ATS scores, or making causal claims. | Pass |
| **V. Lean, Testable Delivery** | Bounded strictly to PRD Story 5. Test directory in `tests/009-employer-feedback/`. Offline quality gate supported via unit mocks and PGlite. | Pass |

**Post-design review: PASS.**  
All design artifacts (`research.md`, `data-model.md`, `contracts/feedback-api.md`, `contracts/feedback-ui.md`, `quickstart.md`) strictly satisfy constitutional principles and PRD specifications.

---

## Project Structure

### Documentation (this feature)

```text
specs/009-employer-feedback/
├── spec.md                                  # Feature specification
├── plan.md                                  # Implementation plan (this file)
├── research.md                              # Phase 0 architectural decisions
├── data-model.md                            # Entity specifications and relational schemas
├── quickstart.md                            # Runnable verification walkthrough
├── contracts/
│   ├── feedback-api.md                      # tRPC router procedures & Zod contracts
│   └── feedback-ui.md                       # Component hierarchy & accessibility contracts
└── checklists/
    └── requirements.md                      # Spec quality checklist
```

### Source Code (repository root)

```text
lib/
├── db/
│   └── schema.ts                            # [MODIFY] Add feedbackItems table & types
└── validations/
    └── feedback.ts                          # [NEW] Zod schemas for feedback items and inputs

trpc/routers/
├── _app.ts                                  # [MODIFY] Mount feedbackRouter
└── feedback.ts                              # [NEW] Domain router (listByOpportunityId, byId, create, update, setAiOptIn, delete)

components/
└── feedback/
    ├── feedback-card.tsx                    # [NEW] Feedback card with badges, text, AI switch, actions
    ├── feedback-form-dialog.tsx             # [NEW] Modal dialog to create/edit feedback with privacy notice
    ├── feedback-delete-dialog.tsx           # [NEW] Confirmation alert dialog for deleting feedback
    ├── feedback-source-badge.tsx            # [NEW] Category badge (recruiter, rejection, interview, summary)
    ├── feedback-provenance-badge.tsx        # [NEW] Provenance badge (exact quote vs personal summary)
    ├── feedback-empty-state.tsx             # [NEW] Empty state prompt with create CTA
    └── opportunity-feedback-section.tsx     # [NEW] Embedded section in opportunity detail view

app/
└── dashboard/
    └── opportunities/
        └── [opportunityId]/
            └── page.tsx                     # [MODIFY] Embed OpportunityFeedbackSection between Evidence and Requirements

drizzle/
├── 0005_add_feedback_items_table.sql        # [NEW] Generated migration SQL
└── meta/                                    # [MODIFY] Updated Drizzle migration snapshots

tests/009-employer-feedback/
├── boundaries/
│   └── feedback-boundary.test.ts            # [NEW] Static boundaries & server-only import assertions
├── procedures/
│   └── feedback-router.test.ts              # [NEW] Procedure contracts, ownership, opt-in, & cascade tests
└── components/
    └── feedback-views.test.tsx              # [NEW] Form, card, modal, and accessibility axe tests
```

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations. Design strictly adheres to all core principles and MVP constraints.*
