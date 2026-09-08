---

description: "Task list for the Type-Safe API Migration feature"
---

# Tasks: Type-Safe API Migration

**Input**: Design documents from `/specs/004-type-safe-api-migration/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Required by FR-015, FR-016, the constitution, and the validation quickstart.

**Organization**: Tasks are grouped by user story so each increment can be validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the reviewed API/client dependencies and prepare the feature test layout.

- [X] T001 Add aligned tRPC v11, TanStack React Query v5, SuperJSON, and `client-only` dependencies and lockfile entries in `package.json` and `bun.lock`
- [X] T002 [P] Create the test directories specified by the plan under `tests/004-type-safe-api-migration/`
- [X] T003 [P] Record the new dependency and validation expectations in `specs/004-type-safe-api-migration/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared tRPC boundary, safe context, transport, consumers, and enforcement mechanisms required by every story.

**⚠️ CRITICAL**: No user-story work begins before this phase is complete.

- [X] T004 Create shared tRPC initialization, request-header context, public/protected procedure bases, safe error formatter, and redacted error logging in `trpc/init.ts`
- [X] T005 Create the root router, exported `AppRouter` type, and minimal non-domain system router in `trpc/routers/_app.ts` and `trpc/routers/system.ts`
- [X] T006 Add the GET/POST Fetch-adapter endpoint with the server context in `app/api/trpc/[trpc]/route.ts`
- [X] T007 [P] Create the SuperJSON-aware QueryClient factory in `trpc/query-client.ts`
- [X] T008 Create the client-only tRPC/TanStack provider and typed hook entry point in `trpc/client.tsx`
- [X] T009 Create the server-only in-process tRPC caller/options proxy using async request headers in `trpc/server.tsx`
- [X] T010 Mount the leaf tRPC provider without converting application pages/layouts into client components in `app/layout.tsx`
- [X] T011 [P] Add context and protected-procedure tests for anonymous, valid, expired, and forged sessions in `tests/004-type-safe-api-migration/context/context.test.ts` and `tests/004-type-safe-api-migration/procedures/access.test.ts`
- [X] T012 [P] Add input-before-effects, safe error taxonomy, and redacted logger tests in `tests/004-type-safe-api-migration/procedures/input-errors.test.ts`
- [X] T013 [P] Add Fetch transport tests proving `/api/trpc` delegates GET/POST with request headers and remains separate from Better Auth in `tests/004-type-safe-api-migration/transport/route.test.ts`
- [X] T014 [P] Add server-caller and interactive-provider boundary tests in `tests/004-type-safe-api-migration/consumers/consumers.test.tsx`
- [X] T015 Add a recursive migration-inventory/static-boundary test that rejects unclassified Server Actions, direct application DB access, and browser server imports in `tests/004-type-safe-api-migration/boundaries/migration-inventory.test.ts`

**Checkpoint**: One public and one protected system procedure work through their intended server and browser consumers; invalid identity/input and unsafe imports fail safely.

---

## Phase 3: User Story 1 - Use One Consistent Application Boundary (Priority: P1) 🎯 MVP

**Goal**: Make the shared type-safe boundary the only path for application-owned server operations while preserving supported provider and infrastructure boundaries.

**Independent Test**: The system procedure is callable through the documented server and browser paths, and the recursive inventory classifies every existing operation.

### Tests for User Story 1

- [X] T016 [P] [US1] Add router contract tests for inferred input/output behavior and public system operation handling in `tests/004-type-safe-api-migration/procedures/system-contract.test.ts`
- [X] T017 [P] [US1] Add inventory assertions for every retained exception in `tests/004-type-safe-api-migration/boundaries/migration-inventory.test.ts`

### Implementation for User Story 1

- [X] T018 [US1] Document the contributor-facing public/protected procedure, server consumer, and interactive consumer rules in `specs/004-type-safe-api-migration/contracts/application-api.md`
- [X] T019 [US1] Populate and validate every current Server Action, Route Handler, server read, and direct database/platform call in `specs/004-type-safe-api-migration/contracts/migration-inventory.md`
- [X] T020 [US1] Enforce the inventory and server-only import rules across `app/`, `components/`, `lib/`, and `trpc/` through `tests/004-type-safe-api-migration/boundaries/migration-inventory.test.ts`

**Checkpoint**: User Story 1 is complete when application-owned calls have one type-safe boundary and each remaining native boundary has a verified rationale.

---

## Phase 4: User Story 2 - Preserve Private, Owner-Scoped Access (Priority: P1)

**Goal**: Ensure every protected operation derives identity from Better Auth and establishes the reusable owner-scoping contract for future product data.

**Independent Test**: Anonymous/forged requests fail before services run; valid sessions reach protected behavior; foreign and missing resource outcomes are indistinguishable at the contract seam.

### Tests for User Story 2

- [X] T021 [P] [US2] Add protected-middleware tests proving caller input cannot establish identity in `tests/004-type-safe-api-migration/procedures/access.test.ts`
- [X] T022 [P] [US2] Add owner-scoping contract tests for owner success and indistinguishable missing/foreign outcomes without product CRUD in `tests/004-type-safe-api-migration/procedures/ownership.test.ts`

### Implementation for User Story 2

- [X] T023 [US2] Add context-derived actor-ID and unavailable-resource helpers for future repositories in `trpc/init.ts`
- [X] T024 [US2] Use the protected system procedure to verify session propagation and non-sensitive identity output in `trpc/routers/system.ts`
- [X] T025 [US2] Document the mandatory future repository owner-predicate and RLS release gate in `specs/004-type-safe-api-migration/contracts/application-api.md`

**Checkpoint**: User Story 2 is complete when protected procedures trust only the validated session and future owner-scoped operations have an executable denial contract.

---

## Phase 5: User Story 3 - Receive Reliable Validation and Errors (Priority: P2)

**Goal**: Give consumers safe correction/sign-in/retry outcomes without leaking sensitive content or persisting partial work.

**Independent Test**: Malformed, unauthorized, conflict, rate-limit, and unexpected failure fixtures map to safe outcomes and do not call effects before rejection.

### Tests for User Story 3

- [X] T026 [P] [US3] Extend error-mapping tests for all approved codes and safe field errors in `tests/004-type-safe-api-migration/procedures/input-errors.test.ts`
- [X] T027 [P] [US3] Add log/output redaction fixtures for credentials, sessions, database details, and private source content in `tests/004-type-safe-api-migration/procedures/input-errors.test.ts`

### Implementation for User Story 3

- [X] T028 [US3] Finalize the approved failure-code mapping and allowlisted error serialization in `trpc/init.ts`
- [X] T029 [US3] Add safe consumer recovery handling for the representative interactive procedure in `trpc/client.tsx` and `trpc/routers/system.ts`
- [X] T030 [US3] Document transaction and idempotency requirements for future multi-step mutations in `specs/004-type-safe-api-migration/contracts/application-api.md`

**Checkpoint**: User Story 3 is complete when every representative failure is actionable, redacted, and effect-free until all checks pass.

---

## Phase 6: User Story 4 - Migrate Without Regressing Existing Authentication (Priority: P2)

**Goal**: Preserve current account and route-protection behavior while removing plain authentication Server Actions where the provider client supports equivalent behavior.

**Independent Test**: Sign-up, sign-in, sign-out, invalid input, provider failure, safe `next`, expired session, and protected redirects retain the accepted behavior from Specification 003.

### Tests for User Story 4

- [X] T031 [P] [US4] Add sign-up/sign-in pending, validation, generic-error, and safe-return-path regression tests in `tests/004-type-safe-api-migration/auth/auth-forms.test.tsx`
- [X] T032 [P] [US4] Add sign-out, expired-session, browser-back, and private-route regression tests in `tests/004-type-safe-api-migration/auth/auth-routes.test.tsx`

### Implementation for User Story 4

- [X] T033 [US4] Adapt the sign-in form to the Better Auth browser client while preserving accessible pending/error behavior in `components/auth/sign-in-form.tsx`
- [X] T034 [P] [US4] Adapt the sign-up form to the Better Auth browser client while preserving immediate-session behavior in `components/auth/sign-up-form.tsx`
- [X] T035 [P] [US4] Adapt the sign-out control to the Better Auth browser client while preserving redirect/error behavior in `components/auth/sign-out-button.tsx`
- [X] T036 [US4] Remove migrated authentication Server Actions and their unsafe raw caught-error logging from `app/(auth)/actions.ts`
- [X] T037 [US4] Retain and verify provider-owned route handling and page-level/session redirect defenses in `app/api/auth/[...all]/route.ts`, `lib/auth/session.ts`, `app/page.tsx`, `app/dashboard/page.tsx`, and `proxy.ts`

**Checkpoint**: User Story 4 is complete when no migrated auth form imports a Server Action, Better Auth keeps cookie semantics, and private routes remain protected.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete boundary and publish safe delivery evidence.

- [X] T038 [P] Run and address feature tests, lint, typecheck, full Jest suite, and production build using `package.json` scripts
- [X] T039 [P] Execute the manual and release-evidence checks in `specs/004-type-safe-api-migration/quickstart.md`
- [X] T040 Review the final migration inventory, contracts, and test coverage against FR-001 through FR-018 in `specs/004-type-safe-api-migration/`

---

## Dependencies & Execution Order

- **Phase 1** starts immediately.
- **Phase 2** depends on T001–T003 and blocks all stories.
- **US1** depends on the foundational router/transport/consumer boundary.
- **US2** depends on protected middleware from Phase 2; it can proceed alongside US1 documentation after that point.
- **US3** depends on safe formatter/logger foundations from Phase 2 and may proceed alongside US2.
- **US4** depends on the regression test harness; it does not depend on domain procedures.
- **Polish** depends on the desired story phases being complete.

## Parallel Opportunities

- T002 and T003 can run in parallel after dependency installation is decided.
- T007 and T011–T014 touch independent files after T004–T006 establish interfaces.
- T016/T017, T021/T022, T026/T027, and T031/T032 are independent test work within their stories.
- T033–T035 modify distinct auth form files after their shared regression tests exist.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 and validate its system procedure and migration inventory.
3. Stop for an independent architecture review before expanding application-domain work.

### Incremental Delivery

1. Add authorization contract coverage (US2).
2. Add safe failure behavior (US3).
3. Migrate provider-native authentication forms and verify regressions (US4).
4. Finish cross-cutting checks and record release evidence.
