---

description: "Dependency-ordered implementation tasks for Better Auth user authentication"
---

# Tasks: User Authentication

**Input**: Design documents from `/specs/003-user-authentication/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required. FR-013 and the constitution require automated coverage of authentication, protected-route, failure, and session-invalidating behavior.

**Organization**: Tasks are grouped by user story so each increment can be validated independently once its dependencies are complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its listed dependencies are complete and it changes different files.
- **[Story]**: Maps a task to a user story in [spec.md](./spec.md).

## Phase 1: Governance and Setup

**Purpose**: Clear the documented architecture gate and prepare the approved Better Auth dependency boundary.

- [X] T001 Amend `docs/prd/prd.md` and `.specify/memory/constitution.md` to replace Supabase Auth, record deferred email verification, and define the Better Auth identity-to-RLS design; obtain project-owner approval before implementation.
- [ ] T002 Install the Better Auth best-practices skill using the command recorded in `specs/003-user-authentication/research.md` and record its availability in the feature change record at `specs/003-user-authentication/research.md`.
- [ ] T003 Add reviewed, pinned `better-auth` and `zod` dependencies to `package.json` and commit the resulting `bun.lock` changes.
- [ ] T004 Add credential-free Better Auth configuration placeholders and browser-safe/server-only classification to `.env.example`.
- [X] T005 Update the authentication feature assumptions and constitution-check outcome in `specs/003-user-authentication/plan.md` after T001 approval.

---

## Phase 2: Foundational Authentication Infrastructure

**Purpose**: Establish the server-only Better Auth, storage, validation, and route-security foundation that blocks all user stories.

**⚠️ CRITICAL**: Do not begin a user-story phase until T006–T014 are complete.

- [ ] T006 Generate Better Auth’s Drizzle schema for PostgreSQL, review the required public-schema auth records and Data API restrictions, and merge the approved declarations into `lib/db/schema.ts`.
- [X] T007 Generate and review the auth-schema migration in `drizzle/0001_better_auth.sql` and update `drizzle/meta/_journal.json` without applying undocumented dashboard changes.
- [ ] T008 [P] Add migration and public-schema/Data API boundary tests in `tests/003-user-authentication/migrations/better-auth-schema.test.ts`.
- [ ] T009 [P] Add Better Auth environment parsing and safe-return-path validation tests in `tests/003-user-authentication/auth/config-and-return-path.test.ts`.
- [X] T010 Implement server-only Better Auth configuration, explicit base URL, trusted-origin allowlist, Drizzle adapter, and immediate email/password session settings in `lib/auth.ts`.
- [X] T011 Implement the narrow browser-side Better Auth client boundary in `lib/auth-client.ts` without exposing database credentials or secrets.
- [X] T012 Implement Zod input validation, generic error mapping, and same-application `next` sanitization in `lib/auth/validation.ts`.
- [X] T013 Implement the authoritative server-side session lookup and `requireSession` helper in `lib/auth/session.ts`.
- [X] T014 Mount Better Auth’s supported GET/POST handler at `app/api/auth/[...all]/route.ts`.

**Checkpoint**: The provider is configured only on the server, its public-schema migration has RLS and Data API restrictions, and server code can authoritatively validate a request session.

---

## Phase 3: User Story 1 - Create a Private Account (Priority: P1) 🎯 MVP

**Goal**: A visitor can register with valid email/password credentials, receive an authenticated session immediately, and reach the dashboard.

**Independent Test**: Using a mocked Better Auth provider, submit valid registration credentials and assert a session-aware dashboard appears; submit invalid or duplicate credentials and assert a generic, accessible error with no private content.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add registration-action validation, duplicate-request, generic-error, and immediate-session tests in `tests/003-user-authentication/auth/sign-up-action.test.ts`.
- [ ] T016 [P] [US1] Add accessible registration-form pending, validation, and failure-state tests in `tests/003-user-authentication/components/sign-up-form.test.tsx`.
- [ ] T017 [P] [US1] Add registration-to-dashboard route-flow tests in `tests/003-user-authentication/routes/sign-up-flow.test.tsx`.

### Implementation for User Story 1

- [X] T018 [US1] Implement the server-side registration action using `lib/auth.ts` and `lib/auth/validation.ts` in `app/(auth)/actions.ts`.
- [X] T019 [US1] Implement the accessible email/password registration form with pending and generic-error states in `components/auth/sign-up-form.tsx`.
- [X] T020 [US1] Implement the registration page in `app/(auth)/sign-up/page.tsx` using `components/auth/sign-up-form.tsx`.
- [X] T021 [US1] Implement the minimal session-validated private dashboard inside the retained Project Foundation shell in `app/dashboard/layout.tsx` and `app/dashboard/page.tsx` using `lib/auth/session.ts`.

**Checkpoint**: A new user can independently create an account and receive immediate authenticated dashboard access.

---

## Phase 4: User Story 2 - Sign In to a Private Workspace (Priority: P1)

**Goal**: A registered user can sign in safely and resume at a validated private destination.

**Independent Test**: With a mocked registered account, submit valid credentials and reach `/dashboard` or a safe requested path; submit invalid credentials and confirm no account-existence signal or private content is exposed.

### Tests for User Story 2

- [ ] T022 [P] [US2] Add sign-in action tests for valid credentials, generic invalid credentials, safe `next`, and malformed/external `next` values in `tests/003-user-authentication/auth/sign-in-action.test.ts`.
- [ ] T023 [P] [US2] Add accessible sign-in form pending and failure-state tests in `tests/003-user-authentication/components/sign-in-form.test.tsx`.
- [ ] T024 [P] [US2] Add valid-session reload and internal-return-destination route-flow tests in `tests/003-user-authentication/routes/sign-in-flow.test.tsx`.

### Implementation for User Story 2

- [X] T025 [US2] Extend the server-side authentication actions for sign-in and sanitized return destinations in `app/(auth)/actions.ts`.
- [X] T026 [US2] Implement the accessible email/password sign-in form in `components/auth/sign-in-form.tsx`.
- [X] T027 [US2] Implement the sign-in entry page and sign-up link in `app/(auth)/sign-in/page.tsx`.

**Checkpoint**: An existing user can independently sign in and continue an active session without an unsafe redirect or account-enumeration detail.

---

## Phase 5: User Story 3 - Protect Workspace Routes (Priority: P1)

**Goal**: Every private route denies an absent, expired, invalid, or forged session before private content renders.

**Independent Test**: Request `/`, `/dashboard`, and the protected action/handler paths with absent, expired, invalid, and forged session data; each request with no valid session must reach sign-in without private content, while valid sessions retain access.

### Tests for User Story 3

- [ ] T028 [P] [US3] Add proxy matcher and cookie-presence redirect tests in `tests/003-user-authentication/routes/proxy.test.ts`.
- [ ] T029 [P] [US3] Add authoritative dashboard session-validation tests for absent, expired, invalid, and forged sessions in `tests/003-user-authentication/routes/dashboard-protection.test.tsx`.
- [ ] T030 [P] [US3] Add server action and provider handler authorization-boundary tests in `tests/003-user-authentication/auth/server-boundary.test.ts`.

### Implementation for User Story 3

- [X] T031 [US3] Implement the root-level, narrow cookie-presence redirect prefilter and protected matcher in `proxy.ts`; do not treat it as authorization.
- [X] T032 [US3] Implement the root route resolver in `app/page.tsx` to direct authenticated users to `/dashboard` and all others to `/sign-in` without rendering the retired public foundation-demo content; retain the shared shell at private workspace routes.
- [X] T033 [US3] Apply `requireSession` to every private page and authenticated server action in `app/dashboard/page.tsx` and `app/(auth)/actions.ts`; do not gate Better Auth’s public sign-up/sign-in handler at `app/api/auth/[...all]/route.ts`.

**Checkpoint**: Direct navigation, stale sessions, browser refreshes, and forged cookies cannot reveal private workspace content.

---

## Phase 6: User Story 4 - Sign Out Safely (Priority: P2)

**Goal**: A signed-in user can visibly sign out, ending the current session before returning to sign-in.

**Independent Test**: Sign in, invoke sign-out, then revisit `/dashboard` by direct navigation and browser Back; both attempts require a new sign-in.

### Tests for User Story 4

- [ ] T034 [P] [US4] Add sign-out action tests for session invalidation and generic provider failures in `tests/003-user-authentication/auth/sign-out-action.test.ts`.
- [ ] T035 [P] [US4] Add sign-out-button accessibility and pending-state tests in `tests/003-user-authentication/components/sign-out-button.test.tsx`.
- [ ] T036 [P] [US4] Add browser-back and direct-private-route sign-out flow tests in `tests/003-user-authentication/routes/sign-out-flow.test.tsx`.

### Implementation for User Story 4

- [X] T037 [US4] Implement the server-side sign-out action that invalidates the active Better Auth session before redirecting in `app/(auth)/actions.ts`.
- [X] T038 [US4] Implement the visible accessible sign-out control in `components/auth/sign-out-button.tsx`.
- [X] T039 [US4] Add the sign-out control to the validated dashboard in `app/dashboard/page.tsx`.

**Checkpoint**: A sign-out reliably ends the active session and no later private route access succeeds until a new sign-in.

---

## Phase 7: Polish and Cross-Cutting Validation

**Purpose**: Verify the feature as a whole, preserve boundaries, and document the final operational path.

- [ ] T040 [P] Add static tests that prevent Better Auth secrets, database URLs, and raw session values from entering browser-facing files in `tests/003-user-authentication/auth/secret-boundary.test.ts`.
- [X] T041 [P] Update Better Auth setup, required environment values, migration review, and validation instructions in `docs/authentication.md`.
- [ ] T042 Run the end-to-end scenarios in `specs/003-user-authentication/quickstart.md` against disposable configuration and record safe redacted evidence in `specs/003-user-authentication/quickstart.md`.
- [X] T043 Run `bun run lint`, `bun run typecheck`, and `bun run test`; resolve failures and record results in `specs/003-user-authentication/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: T001 is a mandatory governance gate. T002–T005 follow the approved amendment.
- **Phase 2**: Depends on Phase 1; T006–T014 block every user story.
- **US1 (Phase 3)**: Depends on Phase 2 and is the first deliverable.
- **US2 (Phase 4)**: Depends on Phase 2 and the dashboard destination created in US1.
- **US3 (Phase 5)**: Depends on Phase 2 and applies the private-route enforcement to the US1 dashboard and US2 actions.
- **US4 (Phase 6)**: Depends on Phase 2 and the authenticated dashboard from US1.
- **Polish (Phase 7)**: Depends on every desired user story.

### User Story Dependencies

```text
Governance + Foundation
        └── US1: Registration → dashboard
                ├── US2: Existing-user sign-in
                ├── US3: Full private-route enforcement
                └── US4: Sign-out
                         └── Polish and end-to-end validation
```

### Parallel Opportunities

- After T007, T008 and T009 can proceed in parallel; T010 and T011 then change distinct server/client modules.
- Within US1, T015–T017 can be authored in parallel; within US2, T022–T024 can be authored in parallel.
- Within US3, T028–T030 can be authored in parallel; within US4, T034–T036 can be authored in parallel.
- T040 and T041 can proceed in parallel after the corresponding implementation is stable.

## Implementation Strategy

### MVP First

1. Complete and approve the governance work in Phase 1.
2. Complete the private Better Auth foundation in Phase 2.
3. Complete US1 and validate immediate registration-to-dashboard access.
4. Add US3 before any deployment so the initial private dashboard has defense-in-depth route enforcement.

### Incremental Delivery

1. US1 provides immediate account registration and one protected destination.
2. US2 enables returning users to sign in safely.
3. US3 hardens route behavior against direct, stale, and forged-session access.
4. US4 completes shared-device privacy with explicit sign-out.
