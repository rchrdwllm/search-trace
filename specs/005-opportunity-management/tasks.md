# Tasks: Opportunity Management

**Branch**: `005-opportunity-management`
**Input**: Design artifacts from `specs/005-opportunity-management/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/`, `quickstart.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure for opportunity management

- [X] T001 Create test directories under `tests/005-opportunity-management/` (`db/`, `procedures/`, `components/`, `boundaries/`)
- [X] T002 [P] Create shared Zod validation schemas for opportunities in `lib/validations/opportunity.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, and shared UI primitives required before ANY user story can proceed

**⚠️ CRITICAL**: Must be completed before implementing user story procedures and views.

- [X] T003 Add `opportunities` table schema, foreign key to `user.id`, and indexes in `lib/db/schema.ts`
- [X] T004 Write database schema and index constraint tests in `tests/005-opportunity-management/db/schema.test.ts`
- [X] T005 Generate Drizzle migration for the `opportunities` table into `drizzle/` via `bun run db:generate -- --name add_opportunities_table`
- [X] T006 Create accessible styled `Textarea` UI primitive in `components/ui/textarea.tsx`
- [X] T007 [P] Create opportunity status badge component in `components/opportunities/opportunity-status-badge.tsx`

**Checkpoint**: Database table and shared UI primitives ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Capture a New Opportunity (Priority: P1) 🎯 MVP

**Goal**: An authenticated job seeker can create a new job opportunity with company, role, pasted job description, optional HTTPS source URL, and default `draft` status.

**Independent Test**: Submit a new opportunity form with required fields; verify that the opportunity is created in the database and the user is redirected to its detail view.

### Tests for User Story 1

- [X] T008 [P] [US1] Write contract and validation unit tests for opportunity creation in `tests/005-opportunity-management/procedures/opportunity-router.test.ts`
- [X] T010 [P] [US1] Write component tests for opportunity creation form in `tests/005-opportunity-management/components/opportunity-forms.test.ts`

### Implementation for User Story 1

- [X] T009 [US1] Implement `opportunity.create` mutation in `trpc/routers/opportunity.ts` and register router in `trpc/routers/_app.ts`
- [X] T011 [US1] Implement shared opportunity form component in `components/opportunities/opportunity-form.tsx`
- [X] T012 [US1] Implement New Opportunity page at `app/dashboard/opportunities/new/page.tsx`

**Checkpoint**: At this point, User Story 1 is functional: a user can navigate to `/dashboard/opportunities/new` and create opportunities.

---

## Phase 4: User Story 2 - Browse Saved Opportunities on Dashboard (Priority: P1)

**Goal**: An authenticated job seeker can view their list of saved opportunities on the private dashboard or an empty state onboarding card if they have none.

**Independent Test**: Navigate to `/dashboard`; verify that owned opportunities appear with company, role, status badge, and update date, or empty state CTA appears if none exist.

### Tests for User Story 2

- [X] T013 [P] [US2] Write tests for `opportunity.list` procedure in `tests/005-opportunity-management/procedures/opportunity-router.test.ts`
- [X] T015 [P] [US2] Write component tests for dashboard opportunity list and empty state in `tests/005-opportunity-management/components/opportunity-list.test.ts`

### Implementation for User Story 2

- [X] T014 [US2] Implement `opportunity.list` query with user-scoping in `trpc/routers/opportunity.ts`
- [X] T016 [P] [US2] Implement `OpportunityCard` component in `components/opportunities/opportunity-card.tsx`
- [X] T017 [US2] Update dashboard landing page in `app/dashboard/page.tsx` to display opportunity list, empty state, and "New Opportunity" CTA

**Checkpoint**: User Stories 1 and 2 deliver an end-to-end flow: creating opportunities and viewing them on the dashboard.

---

## Phase 5: User Story 3 - View Opportunity Details (Priority: P1)

**Goal**: An authenticated user can inspect the full details of an opportunity, including a safe external link to the source posting and safe plain-text rendering of the pasted job description.

**Independent Test**: Open `/dashboard/opportunities/[opportunityId]`; verify company, role, status, external source link, and plain-text job description render safely.

### Tests for User Story 3

- [X] T018 [P] [US3] Write tests for `opportunity.byId` procedure in `tests/005-opportunity-management/procedures/opportunity-router.test.ts`

### Implementation for User Story 3

- [X] T019 [US3] Implement `opportunity.byId` query with ownership verification in `trpc/routers/opportunity.ts`
- [X] T020 [US3] Implement opportunity detail view page in `app/dashboard/opportunities/[opportunityId]/page.tsx`

**Checkpoint**: Full view capabilities operational for captured opportunities.

---

## Phase 6: User Story 4 - Edit Opportunity Details and Status (Priority: P2)

**Goal**: An authenticated user can update the company, role, job description, source URL, or status of an existing opportunity.

**Independent Test**: Open `/dashboard/opportunities/[opportunityId]/edit`, modify fields, submit; verify that updated fields are persisted and displayed.

### Tests for User Story 4

- [X] T021 [P] [US4] Write tests for `opportunity.update` mutation in `tests/005-opportunity-management/procedures/opportunity-router.test.ts`

### Implementation for User Story 4

- [X] T022 [US4] Implement `opportunity.update` mutation with ownership verification in `trpc/routers/opportunity.ts`
- [X] T023 [US4] Implement Edit Opportunity page in `app/dashboard/opportunities/[opportunityId]/edit/page.tsx`

**Checkpoint**: Full edit and status transition capabilities functional.

---

## Phase 7: User Story 5 - Delete an Opportunity with Confirmation (Priority: P2)

**Goal**: An authenticated user can permanently delete an opportunity after explicit confirmation in an accessible modal dialog.

**Independent Test**: Click "Delete" on an opportunity detail page, confirm dialog; verify opportunity is deleted, user is redirected to `/dashboard`, and record is removed.

### Tests for User Story 5

- [X] T024 [P] [US5] Write tests for `opportunity.delete` mutation in `tests/005-opportunity-management/procedures/opportunity-router.test.ts`

### Implementation for User Story 5

- [X] T025 [US5] Implement `opportunity.delete` mutation with ownership verification in `trpc/routers/opportunity.ts`
- [X] T026 [P] [US5] Implement accessible delete confirmation dialog in `components/opportunities/opportunity-delete-dialog.tsx`
- [X] T027 [US5] Integrate delete confirmation dialog and deletion flow into `app/dashboard/opportunities/[opportunityId]/page.tsx`

**Checkpoint**: Opportunity lifecycle complete (Create, List, View, Edit, Delete).

---

## Phase 8: User Story 6 - Enforce Private Workspace Boundaries (Priority: P1)

**Goal**: Ensure strict ownership verification and non-enumeration error handling (`unavailableResource()`) across all opportunity endpoints, plus static boundary assertions.

**Independent Test**: Attempt to access another user's opportunity ID via `byId`, `update`, and `delete`; verify `NOT_FOUND` ("The requested resource is unavailable.") is returned.

### Implementation and Boundary Verification for User Story 6

- [X] T028 [P] [US6] Write cross-user ownership and non-enumeration tests in `tests/005-opportunity-management/procedures/opportunity-router.test.ts`
- [X] T029 [P] [US6] Write static boundary tests in `tests/005-opportunity-management/boundaries/opportunity-boundary.test.ts` verifying no server-only imports in client components

**Checkpoint**: Security and isolation release gates verified.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility checks, full quality gate execution, and validation against quickstart scenarios.

- [X] T030 [P] Write automated accessibility tests with `jest-axe` across opportunity components in `tests/005-opportunity-management/components/opportunity-accessibility.test.tsx`
- [X] T031 Run full repository quality gate (`bun run check`) and execute quickstart scenarios per `specs/005-opportunity-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story phases.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion; can proceed in parallel with or after US1.
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion; benefits from US1 test fixtures.
- **User Story 4 (Phase 6)**: Depends on Phase 3 and Phase 5 completion.
- **User Story 5 (Phase 7)**: Depends on Phase 5 completion.
- **User Story 6 (Phase 8)**: Verifies boundaries of US1–US5 procedures.
- **Polish (Phase 9)**: Depends on all user stories being implemented.

### Parallel Execution Opportunities

- `T002` (validations schema) and `T001` (test directories) can run in parallel in Phase 1.
- `T006` (Textarea primitive) and `T007` (Status badge) can run in parallel with `T003`–`T005` in Phase 2.
- In each story phase, test authoring (`[P]`) can proceed alongside UI scaffolding before integrating with the router.
- `T028` (cross-user tests) and `T029` (boundary tests) in Phase 8 can run in parallel.
- `T030` (accessibility tests) can run in parallel across components.

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete Setup and Foundational phases (schema, migration, Zod validation).
2. Implement User Story 1 (`opportunity.create` and `/dashboard/opportunities/new`).
3. **Validate**: Verify opportunity creation and database persistence independently.

### Incremental Feature Expansion
1. Add User Story 2: Dashboard list view and empty state.
2. Add User Story 3: Detailed view with plain text rendering and safe outbound links.
3. Add User Story 4: Edit flow and status updates.
4. Add User Story 5: Delete modal and affirmative removal.
5. Add User Story 6 & Polish: Cross-user isolation checks, static boundaries, axe tests, and full quality gate (`bun run check`).
