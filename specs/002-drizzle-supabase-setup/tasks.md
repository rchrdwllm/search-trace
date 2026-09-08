---

description: "Actionable implementation tasks for Drizzle and Supabase Setup"
---

# Tasks: Drizzle and Supabase Setup

**Input**: Design documents from `/specs/002-drizzle-supabase-setup/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), and [quickstart.md](./quickstart.md)

**Tests**: Tests are required by FR-010 and FR-011. Write the listed tests first and confirm they fail before their implementation task. The normal test suite must remain offline and credential-free.

**Organization**: Tasks are grouped by user story after shared setup. The planned empty schema baseline is intentionally not a product data model; later features must add RLS, owner-scoping, and cross-user tests before introducing user-owned tables.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when its stated prerequisites are complete and it does not touch the same files.
- **[Story]**: User story from the feature specification.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the explicitly requested project-local guidance and dependencies without changing credentials or a remote Supabase project.

- [X] T001 Install the requested Drizzle skill with `bunx skills add https://github.com/lobehub/lobehub --skill drizzle`, then review the added `.agents/skills/drizzle/` files and `skills-lock.json`.
- [X] T002 Install the requested Supabase skill with `bunx skills add https://github.com/supabase/agent-skills --skill supabase`, then review the added `.agents/skills/supabase/` files and `skills-lock.json`.
- [X] T003 Add `drizzle-orm`, `postgres`, `drizzle-kit`, `dotenv`, and `@electric-sql/pglite` at compatible Bun-resolved versions in `package.json` and `bun.lock`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the failing offline safety and migration tests that protect every story before adding the shared database implementation.

**⚠️ CRITICAL**: Complete this phase before declaring any user story complete. Do not add a user-owned table, secret/service-role key, public database credential, or a live database call to the normal check suite.

- [X] T004 [P] Create failing validation/error-redaction cases for missing, whitespace-only, malformed, and valid database URLs in `tests/002-drizzle-supabase-setup/db/config.test.ts`.
- [X] T005 [P] Create the Node-environment PGlite baseline/idempotency test in `tests/002-drizzle-supabase-setup/migrations/pglite-baseline.test.ts` that applies committed migrations twice without network access.
- [X] T006 [P] Create failing source-boundary and browser-secret regression checks in `tests/002-drizzle-supabase-setup/boundaries/database-static-boundary.test.ts`.

**Checkpoint**: The required test files exist and fail only because the planned database boundary and migration artifacts do not yet exist.

---

## Phase 3: User Story 1 - Configure a Private Development Environment (Priority: P1) 🎯 MVP

**Goal**: A contributor can copy a credential-free reference into `.env.local`, understand each setting’s audience, and receive safe, actionable configuration errors.

**Independent Test**: Copy `.env.example` to ignored `.env.local`; verify a complete candidate is accepted, each missing/malformed candidate identifies the setting and remediation, and no error includes the candidate URL or password.

- [X] T007 [US1] Extend `.env.example` with a blank, clearly server-only `DATABASE_URL` placeholder while preserving the existing two public Supabase placeholders and credential-free comments.
- [X] T008 [US1] Implement `DatabaseConfigurationError`, URL validation, and lazy literal `DATABASE_URL` retrieval in `lib/db/config.ts` to satisfy `tests/002-drizzle-supabase-setup/db/config.test.ts` without echoing a candidate value.
- [X] T009 [US1] Update local configuration, secret-handling, and environment-classification guidance in `README.md` using the table and failure contract in `specs/002-drizzle-supabase-setup/contracts/database-boundary.md`.
- [X] T010 [US1] Run and fix the configuration acceptance cases in `tests/002-drizzle-supabase-setup/db/config.test.ts`, including the explicit no-secret-in-error assertions.

**Checkpoint**: A contributor can configure only the values they need, and configuration errors reveal setting names rather than credentials.

---

## Phase 4: User Story 2 - Establish a Controlled Data-Schema Baseline (Priority: P1)

**Goal**: Contributors can generate, review, and idempotently apply an intentionally empty application-schema baseline through one Drizzle-owned workflow.

**Independent Test**: Run the feature’s PGlite test with no environment variables or network access; it applies the checked-in baseline to an empty database twice and proves the second application creates no duplicate change.

- [X] T011 [US2] Create the canonical empty schema module in `lib/db/schema.ts`, Drizzle Kit configuration in `drizzle.config.ts`, and reviewed baseline SQL/metadata under `drizzle/` without creating SearchTrace domain tables.
- [X] T012 [US2] Implement the guarded Drizzle migration runner in `scripts/db/migrate.ts` and add `db:generate`/`db:migrate` scripts in `package.json`; validate `DATABASE_URL` before connecting and use only the committed `drizzle/` artifacts.
- [X] T013 [US2] Document Drizzle as the sole migration owner, generation/review/application commands, target-review rule, and prohibited alternatives in `README.md` following `specs/002-drizzle-supabase-setup/contracts/schema-workflow.md`.
- [X] T014 [US2] Make `tests/002-drizzle-supabase-setup/migrations/pglite-baseline.test.ts` pass by applying the initial baseline twice and asserting Drizzle’s migration ledger/baseline state without a remote connection.

**Checkpoint**: The committed schema declaration and migration artifacts are reviewable, and the offline migration test proves repeatability.

---

## Phase 5: User Story 3 - Keep Data Access Private by Design (Priority: P2)

**Goal**: The project has a lazy typed database factory that is structurally impossible to use from browser-reachable code and never creates a connection while rendering the shell.

**Independent Test**: Exercise the server factory with a mocked PostgreSQL driver and valid configuration; run static checks and a production build with a unique temporary database-URL sentinel, confirming the sentinel is absent from browser output.

- [X] T015 [US3] Create failing Node-environment lazy-construction, typed-factory, and close-operation cases with a mocked PostgreSQL driver in `tests/002-drizzle-supabase-setup/db/server-boundary.test.ts`.
- [X] T016 [US3] Implement the lazy typed Drizzle/Postgres factory with `server-only` as the first import and a close operation in `lib/db/index.ts`, satisfying `tests/002-drizzle-supabase-setup/db/server-boundary.test.ts`.
- [X] T017 [US3] Complete `tests/002-drizzle-supabase-setup/boundaries/database-static-boundary.test.ts` to reject `lib/db` imports and `DATABASE_URL` references from client-reachable source, public Supabase factories, pages, and layouts.
- [X] T018 [US3] Add the production-build sentinel procedure and zero-connection shell expectation to `README.md`, then run `bun run build` and the boundary tests to confirm no server connection value is emitted in browser output.

**Checkpoint**: Browser-reachable source has no direct database path, while future server work has a typed, lazy entry point.

---

## Phase 6: User Story 4 - Use Maintained Integration Guidance (Priority: P3)

**Goal**: Contributors can verify that the requested Drizzle and Supabase skills are installed and know when their guidance is a prerequisite for future database/auth work.

**Independent Test**: Inspect `.agents/skills/drizzle/`, `.agents/skills/supabase/`, and `skills-lock.json`; follow the README instructions in a clean contributor environment without changing `.env.local` or a remote project.

- [X] T019 [US4] Verify that `skills-lock.json`, `.agents/skills/drizzle/`, and `.agents/skills/supabase/` record the two requested installs, and correct any incomplete installation before database implementation continues.
- [X] T020 [US4] Add the exact skill-install commands, availability check, and failure boundary to `README.md` and link the ongoing workflow to `specs/002-drizzle-supabase-setup/quickstart.md`.

**Checkpoint**: The requested current guidance is available locally, and a failed skill installation cannot lead to credential exposure or an unreviewed backend change.

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Verify the complete feature against its contracts without expanding it into auth, RLS, or application data work.

- [X] T021 Run `bun run check`, `bun run test -- tests/002-drizzle-supabase-setup`, and `bun run build`; resolve failures in the affected files under `tests/002-drizzle-supabase-setup/`, `lib/db/`, `drizzle/`, `scripts/db/`, or `README.md`.
- [X] T022 Perform the opt-in disposable-target procedure in `specs/002-drizzle-supabase-setup/quickstart.md` with a private `DATABASE_URL`, run `bun run db:migrate` twice, and record only pass/fail plus remediation (never the URL, password, or other credential) in the implementation handoff or PR description.
- [X] T023 Review changed files against `specs/002-drizzle-supabase-setup/spec.md` and `specs/002-drizzle-supabase-setup/contracts/`; confirm there are still no user-owned tables, RLS claims, auth flows, storage operations, secret keys, or browser database imports.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately. T001 and T002 are sequential because both update `skills-lock.json`; T003 follows to establish packages.
- **Phase 2 (Foundational)**: Starts after T003. T004, T005, and T006 can run in parallel because they create separate test files.
- **US1 (Phase 3)**: Starts after T004. T008 depends on T004; T009 can proceed after T007; T010 closes the story after T007–T009.
- **US2 (Phase 4)**: T011 follows T003; T012 depends on T008 and T011; T014 depends on T005, T011, and T012. T013 follows T012.
- **US3 (Phase 5)**: T015 depends on T003; T016 depends on T008 and T015; T017 depends on T006 and T016; T018 depends on T017.
- **US4 (Phase 6)**: T019 depends on T001–T002; T020 depends on T019. It can be completed before or alongside US1–US3 after Setup.
- **Phase 7 (Polish)**: T021 follows all desired user-story checkpoints. T022 is optional and requires a deliberately selected disposable Supabase target. T023 is the final scope/security review.

### User Story Dependencies

```text
Setup → Foundational tests
            ├── US1: private configuration ──┐
            ├── US4: maintained skills ──────┼──→ final validation
            └── US2: schema baseline ────────┤
                    └── US3: server-only DB ─┘
```

- **US1** is the MVP. It establishes the safe configuration contract needed by the actual migration runner.
- **US2** depends on US1’s validator for its credential-safe migration entry point, but its PGlite test remains offline and independently validates migration behavior.
- **US3** depends on US1’s configuration module and can otherwise proceed independently from the schema baseline.
- **US4** depends only on Setup and is independent of the application code.

### Parallel Opportunities

- After T003, T004, T005, and T006 can be implemented in parallel.
- After T008, the US2 migration runner (T011–T014), US3 boundary (T015–T018), and US4 verification/documentation (T019–T020) have separate primary files and can be assigned in parallel, subject to coordinating the shared `README.md` edits.
- T013, T018, and T020 all edit `README.md`; complete or combine them sequentially to avoid conflicts.

## Parallel Example: Foundational Tests

```text
Task: "Create database configuration tests in tests/002-drizzle-supabase-setup/db/config.test.ts"
Task: "Create PGlite migration tests in tests/002-drizzle-supabase-setup/migrations/pglite-baseline.test.ts"
Task: "Create static-boundary tests in tests/002-drizzle-supabase-setup/boundaries/database-static-boundary.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete requested skill installs and package setup.
2. Add failing configuration tests.
3. Add the public/server-only placeholders and implement the safe database configuration validator.
4. Update the contributor setup documentation.
5. Stop and validate US1: all configuration cases pass with zero database connection and zero credential leakage.

### Incremental Delivery

1. Deliver US1 for safe local configuration.
2. Add US2’s empty schema baseline and offline idempotent migration proof.
3. Add US3’s lazy server-only typed database factory and bundle boundary checks.
4. Verify US4’s installed guidance and document it.
5. Complete the full offline gate, then run the optional disposable-Supabase check only with explicitly supplied credentials.
