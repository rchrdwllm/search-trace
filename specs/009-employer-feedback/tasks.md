# Tasks: Opportunity Employer Feedback and Provenance Preservation

**Branch**: `009-employer-feedback`  
**Input**: Design artifacts from `specs/009-employer-feedback/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize directory structure, validation schemas, and shared types for employer feedback.

- [X] T001 Create test and component directories under `tests/009-employer-feedback/` (`boundaries/`, `procedures/`, `components/`) and `components/feedback/`
- [X] T002 [P] Create shared Zod validation schemas and types for employer feedback items and router inputs in `lib/validations/feedback.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Drizzle migration, and boundary isolation tests required before ANY user story can proceed.

**⚠️ CRITICAL**: Must be complete before implementing user story procedures and views.

- [X] T003 Add `feedback_items` table schema with indexes and cascading foreign keys in `lib/db/schema.ts`
- [X] T004 Generate Drizzle migration for the new feedback items table into `drizzle/` via `bun run db:generate -- --name add_feedback_items_table`
- [X] T005 [P] Write static boundary tests asserting server-only database boundaries and isolation in `tests/009-employer-feedback/boundaries/feedback-boundary.test.ts`

**Checkpoint**: Foundation ready — database schema, migration, validations, and boundary checks complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Record and View Opportunity Feedback with Provenance and Privacy Guidance (Priority: P1) 🎯 MVP

**Goal**: Authenticated job seekers can record employer feedback for a specific opportunity with date, text, source type, and provenance label (`exact_quote` vs. `personal_summary`), observe privacy guidance against entering recruiter contact details or email headers, and view all feedback entries for that opportunity.

**Independent Test**: Navigate to an opportunity detail page, open the feedback form, observe the privacy notice, submit feedback with valid metadata, and verify that the feedback card appears with all metadata correctly displayed.

### Tests for User Story 1

- [X] T006 [P] [US1] Write procedure tests for `feedback.listByOpportunityId`, `feedback.byId`, and `feedback.create` with validation and ownership checks in `tests/009-employer-feedback/procedures/feedback-router.test.ts`
- [X] T007 [P] [US1] Write component tests for `FeedbackSourceBadge`, `FeedbackProvenanceBadge`, `FeedbackFormDialog`, `FeedbackEmptyState`, and `FeedbackCard` in `tests/009-employer-feedback/components/feedback-views.test.tsx`

### Implementation for User Story 1

- [X] T008 [US1] Implement `feedback.listByOpportunityId`, `feedback.byId`, and `feedback.create` procedures in `trpc/routers/feedback.ts` and register `feedbackRouter` in `trpc/routers/_app.ts`
- [X] T009 [P] [US1] Implement accessible `FeedbackSourceBadge` component in `components/feedback/feedback-source-badge.tsx`
- [X] T010 [P] [US1] Implement accessible `FeedbackProvenanceBadge` component in `components/feedback/feedback-provenance-badge.tsx`
- [X] T011 [P] [US1] Implement `FeedbackEmptyState` component with call-to-action in `components/feedback/feedback-empty-state.tsx`
- [X] T012 [US1] Implement accessible `FeedbackFormDialog` with privacy guidance alert, character counter, date input, source type selector, and provenance selector in `components/feedback/feedback-form-dialog.tsx`
- [X] T013 [US1] Implement accessible `FeedbackCard` component displaying date, source badge, provenance badge, plain-text body, and action buttons in `components/feedback/feedback-card.tsx`
- [X] T014 [US1] Implement `OpportunityFeedbackSection` coordinator component and embed it into `app/dashboard/opportunities/[opportunityId]/page.tsx`

**Checkpoint**: User Story 1 is fully functional: recording and viewing feedback with provenance and privacy guidance works as an independent MVP.

---

## Phase 4: User Story 2 - Manage AI Inclusion with Explicit Default-Off Opt-In (Priority: P1)

**Goal**: Ensure employer feedback is excluded from AI analysis by default (`aiOptIn: false`), and allow users to explicitly toggle AI inclusion per feedback item.

**Independent Test**: Verify newly created feedback has AI opt-in disabled by default, toggle the switch to enabled, verify persistence, toggle back to disabled, and confirm exclusion from AI requests.

### Tests for User Story 2

- [X] T015 [P] [US2] Write procedure tests for `feedback.setAiOptIn` and default-off invariant in `tests/009-employer-feedback/procedures/feedback-router.test.ts`
- [X] T016 [P] [US2] Write component tests for `FeedbackAiOptInToggle` switch and optimistic updates in `tests/009-employer-feedback/components/feedback-views.test.tsx`

### Implementation for User Story 2

- [X] T017 [US2] Implement `feedback.setAiOptIn` mutation procedure in `trpc/routers/feedback.ts`
- [X] T018 [US2] Integrate accessible `FeedbackAiOptInToggle` switch into `components/feedback/feedback-card.tsx` with screen reader labels and optimistic mutation handling

**Checkpoint**: AI inclusion is safely managed with explicit user consent and default-off protection.

---

## Phase 5: User Story 3 - Edit and Delete Opportunity Feedback (Priority: P2)

**Goal**: Authenticated users can update feedback details (date, text, source type, provenance) and permanently delete feedback entries with confirmation, immediately excluding deleted items from future analyses.

**Independent Test**: Edit an existing feedback item's text and provenance, verify in-place update; initiate deletion, verify confirmation dialog, confirm, and verify permanent removal.

### Tests for User Story 3

- [X] T019 [P] [US3] Write procedure tests for `feedback.update` and `feedback.delete` in `tests/009-employer-feedback/procedures/feedback-router.test.ts`
- [X] T020 [P] [US3] Write component tests for edit mode in `FeedbackFormDialog` and `FeedbackDeleteDialog` confirmation in `tests/009-employer-feedback/components/feedback-views.test.tsx`

### Implementation for User Story 3

- [X] T021 [US3] Implement `feedback.update` and `feedback.delete` procedures in `trpc/routers/feedback.ts`
- [X] T022 [US3] Implement accessible `FeedbackDeleteDialog` alert dialog in `components/feedback/feedback-delete-dialog.tsx`
- [X] T023 [US3] Wire up edit dialog trigger and delete confirmation flow in `components/feedback/feedback-card.tsx` and `components/feedback/opportunity-feedback-section.tsx`

**Checkpoint**: Feedback lifecycle is complete with user-controlled editing and safe deletion.

---

## Phase 6: User Story 4 - Strict Owner Authorization and Privacy Protection (Priority: P1)

**Goal**: Prevent cross-user enumeration, verify ownership on all feedback and opportunity operations, and ensure safe plain-text rendering with zero script injection risk and clean server logging.

**Independent Test**: Attempt cross-user reads, edits, deletes, and AI opt-in updates; verify all return 404 `unavailableResource()`; verify script tags render as plain text; verify zero raw feedback text in server logs.

### Tests for User Story 4

- [X] T024 [P] [US4] Write security & cross-user denial tests in `tests/009-employer-feedback/procedures/feedback-router.test.ts` asserting 404 `unavailableResource()` on foreign reads, creations, edits, deletes, and opt-in toggles
- [X] T025 [P] [US4] Write plain-text rendering and XSS neutralization tests in `tests/009-employer-feedback/components/feedback-views.test.tsx`

### Implementation for User Story 4

- [X] T026 [US4] Audit and assert zero raw feedback text logging across `trpc/routers/feedback.ts` and verify safe plain text rendering styles in `components/feedback/feedback-card.tsx`

**Checkpoint**: Privacy, authorization, and plain-text presentation guarantees are validated and secure.

---

## Phase 7: User Story 5 - Frame Feedback Honestly as Reported Signal (Priority: P2)

**Goal**: Ensure feedback is presented strictly as a reported signal with non-causality disclaimers, avoiding any suggestion of verified rejection causes, scores, or hiring probabilities.

**Independent Test**: Inspect feedback UI across views; verify prominent "Reported Signal" heading, provenance badges, and non-causality disclaimer alert.

### Tests for User Story 5

- [X] T027 [P] [US5] Write component tests verifying "Reported Signal" header, non-causality disclaimer callout, and absence of causal claims in `tests/009-employer-feedback/components/feedback-views.test.tsx`

### Implementation for User Story 5

- [X] T028 [US5] Implement accessible `FeedbackDisclaimerAlert` in `components/feedback/opportunity-feedback-section.tsx` clarifying that feedback represents reported observations rather than proven causality

**Checkpoint**: Feedback is framed honestly as an unverified signal in strict accordance with Constitution Principle IV.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audits, documentation updates, quickstart walkthrough validation, and quality gate execution.

- [X] T029 [P] Run automated accessibility (`jest-axe`) checks across all feedback components in `tests/009-employer-feedback/components/feedback-views.test.tsx`
- [X] T030 Execute manual validation scenarios from `specs/009-employer-feedback/quickstart.md`
- [X] T031 Run complete quality gate (`bun run check`: lint + typecheck + test) to ensure zero regressions across the codebase

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational and User Story 1 router/card structure.
- **User Story 3 (Phase 5)**: Depends on Foundational and User Story 1 components.
- **User Story 4 (Phase 6)**: Depends on User Story 1 and 2 implementation.
- **User Story 5 (Phase 7)**: Depends on User Story 1 section implementation.
- **Polish (Phase 8)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Foundational prerequisite for all feedback UI; delivers core CRUD and MVP value.
- **User Story 2 (P1)**: Extends US1 cards with AI toggle switch; independently testable.
- **User Story 3 (P2)**: Extends US1 cards with edit/delete dialogs; independently testable.
- **User Story 4 (P1)**: Verifies authorization boundaries across US1, US2, and US3 procedures.
- **User Story 5 (P2)**: Verifies non-causality messaging across US1 views.

### Parallel Opportunities

- Within Phase 1: `T002` can be implemented while directory structure is created.
- Within Phase 2: `T005` (static boundary test) can run in parallel with schema/migration generation.
- Within Phase 3: Tests (`T006`, `T007`) can be developed in parallel; badges (`T009`, `T010`) and empty state (`T011`) can be developed in parallel.
- Within Phase 4: `T015` and `T016` can run in parallel.
- Within Phase 5: `T019` and `T020` can run in parallel.
- Within Phase 6: `T024` and `T025` can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`–`T002`).
2. Complete Phase 2: Foundational (`T003`–`T005`) — critical blocking prerequisite.
3. Complete Phase 3: User Story 1 (`T006`–`T014`).
4. **STOP and VALIDATE**: Run `bun run test -- tests/009-employer-feedback/` to confirm MVP functionality.

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready.
2. Deliver User Story 1 -> Test independently -> Core MVP operational (record, list, badges, privacy banner).
3. Deliver User Story 2 -> Test independently -> Explicit AI opt-in toggle operational.
4. Deliver User Story 3 -> Test independently -> Edit and delete workflows operational.
5. Deliver User Story 4 & 5 -> Test independently -> Security isolation and honest signal disclaimers validated.
6. Polish -> Full quality gate (`bun run check`).
