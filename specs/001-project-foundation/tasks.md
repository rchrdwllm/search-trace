---

description: "Actionable implementation tasks for the SearchTrace project foundation"
---

# Tasks: Project Foundation

**Input**: Design documents from `/specs/001-project-foundation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Tests**: Jest tests are required by FR-008–FR-010 and the verification contract. Write the focused test files before the implementation they exercise, and confirm their initial failure where practical.

**Organization**: Tasks are grouped by user story so each increment remains independently testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the selected component system and deterministic verification tooling.

- [X] T001 Record the starting dependency and generated-file inventory, then install the project-level ShadCN skill only if absent using the verbatim procedure in `specs/001-project-foundation/plan.md`.
- [X] T002 Initialize ShadCN only if absent with the `radix-nova` Bun command; preserve root aliases and Tailwind v4 settings in `components.json`.
- [X] T003 Add the executable raw `@efferd` registry URL (not Markdown link syntax) to `components.json` without replacing existing registries.
- [X] T004 Inspect `@efferd/app-shell-4` with `bunx --bun shadcn@latest view`, then install it with `bunx --bun shadcn@latest add`; record the actual generated files, dependencies, warnings, and package changes in `specs/001-project-foundation/implementation-handoff.md`.
- [X] T005 Audit the raw registry output and run strict type checking before productization; document every numbered import, `pxx-4` utility, `IconPlaceholder`, unnamed icon trigger, remote asset, and demo module found in `specs/001-project-foundation/implementation-handoff.md`.
- [X] T006 [P] Add Jest, Next-aware transforms, React Testing Library, user-event, jest-dom, jest-axe, V8 coverage support, and required TypeScript types to `package.json` and `bun.lock`.
- [X] T007 [P] Create the Next-aware Jest configuration, DOM/axe matcher setup, and test directory conventions in `jest.config.ts`, `jest.setup.ts`, and `tests/`.
- [X] T008 Add `typecheck`, `test`, `test:watch`, `test:coverage`, and offline ordered `check` scripts to `package.json`.

**Checkpoint**: The mandated registry block is installed and inventoried; Jest can discover synchronous jsdom tests without network access.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared styling, environment safety, and the test harness required by all stories.

**⚠️ CRITICAL**: Complete this phase before product-story implementation.

- [X] T009 Merge ShadCN semantic OKLCH tokens with existing Geist variables and system-driven dark-mode tokens in `app/globals.css` without adding a theme provider.
- [X] T010 [P] Add `.env.example` with blank public Supabase assignments and developer guidance, and allow only this example file through the environment ignore rule in `.gitignore`.
- [X] T011 [P] Create shared test utilities and deterministic cleanup for environment variables, mocks, and DOM state in `tests/test-utils.tsx` and `jest.setup.ts`.
- [X] T012 [P] Add a source-boundary test that rejects browser-reachable secret/service-role references and known unreviewed registry defects in `tests/foundation/static-boundaries.test.ts`.
- [X] T013 Update contributor commands, environment boundaries, browser-only limitations, and no-live-service expectations in `README.md`.

**Checkpoint**: Semantic styling and configuration guidance exist, and the test harness can enforce static safety boundaries.

---

## Phase 3: User Story 1 - Recognize and Navigate the Application Shell (Priority: P1) 🎯 MVP

**Goal**: Deliver a responsive, accessible, honest SearchTrace shell built from the installed Efferd block rather than a visual imitation.

**Independent Test**: Render the root page with no `.env.local`; confirm SearchTrace identity, a first-focusable skip link, a labeled navigation region, one focusable main landmark, an accessible sidebar trigger, and unavailable future actions without starter or commerce-demo content.

### Tests for User Story 1

- [X] T014 [P] [US1] Write semantic root-page and shell assertions for product identity, landmarks, skip-link destination, unavailable navigation, and no starter/demo content in `tests/app-shell/app-shell.test.tsx`.
- [X] T015 [P] [US1] Write keyboard and sidebar interaction tests for trigger name/state, collapse behavior, skip-link focus movement, and unavailable controls in `tests/app-shell/app-shell-interactions.test.tsx`.
- [X] T016 [P] [US1] Write an axe-focused accessibility test for the composed shell in `tests/app-shell/app-shell-accessibility.test.tsx`.

### Implementation for User Story 1

- [X] T017 [US1] Productize the generated block into the retained `components/app-shell.tsx`, `components/app-sidebar.tsx`, `components/app-header.tsx`, `components/app-breadcrumbs.tsx`, `components/custom-sidebar-trigger.tsx`, `components/nav-group.tsx`, and `components/logo.tsx`; retain its sidebar provider, inset/collapsible sidebar, header trigger, and padded main structure.
- [X] T018 [US1] Replace all Efferd/ecommerce content, fake user data, remote avatars, notifications, account/billing/logout controls, product/store actions, changelog content, and fake routes in `components/app-sidebar.tsx`, `components/app-header.tsx`, `components/app-shared.tsx`, `components/nav-user.tsx`, and `components/latest-change.tsx`; remove demo-only modules no longer needed and record retained/removed/renamed files in `specs/001-project-foundation/implementation-handoff.md`.
- [X] T019 [US1] Resolve all audit defects in retained block files: invalid numbered imports, `pxx-4`, `IconPlaceholder`, unlabelled icon controls, missing avatar text alternatives, and broken client/server boundaries in `components/`.
- [X] T020 [US1] Add a first-focusable skip link and make the adapted sidebar inset exactly one `main#main-content` focus target in `components/app-shell.tsx`.
- [X] T021 [US1] Wire SearchTrace metadata, the thin server root layout, the AppShell, and honest foundation-page copy with no Supabase imports into `app/layout.tsx` and `app/page.tsx`.
- [X] T022 [US1] Add responsive mobile-first wrapping, minimum-width safeguards, focus-visible treatment, and semantic dark-mode compatibility to `components/app-shell.tsx`, `components/app-sidebar.tsx`, and `app/globals.css`.
- [X] T023 [US1] Execute the US1 Jest suite and update `specs/001-project-foundation/implementation-handoff.md` with the raw block inventory and adaptation results.

**Checkpoint**: The product no longer shows starter or demo behavior; the shell is independently usable and testable without service configuration.

---

## Phase 4: User Story 2 - Build Consistent Future Screens (Priority: P2)

**Goal**: Supply accessible, consistent baseline UI patterns and clearly honest placeholder states for later screens.

**Independent Test**: Render representative action, labeled input, content, status, loading, and unavailable compositions within the shell; verify roles, names, disabled/busy/invalid state communication, and no detectable axe violations.

### Tests for User Story 2

- [X] T024 [P] [US2] Write representative Button, Input/FieldLabel, Card, Alert/status, Skeleton, and Spinner semantic/state tests in `tests/ui/foundation-primitives.test.tsx`.
- [X] T025 [P] [US2] Write axe and status-live-region tests for loading, unavailable, and error compositions in `tests/ui/foundation-status.test.tsx`.

### Implementation for User Story 2

- [X] T026 [US2] Add any missing required ShadCN primitives—`button`, `input`, `field`, `card`, `alert`, `skeleton`, and `spinner`—under `components/ui/` only after reconciling what the Efferd block installed.
- [X] T027 [US2] Implement the honest typed unavailable, loading, informational, and error presentation composition in `components/foundation-status.tsx`.
- [X] T028 [US2] Adapt or replace the generated dashboard skeleton with a named, decorative loading composition in `components/foundation-skeleton.tsx`.
- [X] T029 [US2] Apply representative baseline primitive compositions and their disabled/busy/invalid/described states to the foundation page in `app/page.tsx`.
- [X] T030 [US2] Run the US2 Jest suite and record resolved primitives plus any deliberate deferred visual/browser checks in `specs/001-project-foundation/implementation-handoff.md`.

**Checkpoint**: Future contributors have a tested baseline for controls, containers, status messaging, and loading/unavailable states.

---

## Phase 5: User Story 3 - Verify the Foundation Reliably (Priority: P3)

**Goal**: Make the complete automated foundation gate clear, deterministic, and useful on a clean checkout.

**Independent Test**: Run `bun run check` offline and observe lint, strict type checking, and Jest succeed; change a local assertion and confirm a named nonzero failure before restoring it.

### Tests for User Story 3

- [X] T031 [P] [US3] Add regression assertions for restored Create Next App/Vercel content, removed main landmark, enabled deferred navigation, and unexpected shell remote calls in `tests/foundation/foundation-regressions.test.tsx`.
- [X] T032 [P] [US3] Add script-contract tests or documented command assertions for the `check` pipeline in `tests/foundation/verification-contract.test.ts`.
- [X] T050 [US3] Extend shell regression coverage to assert that the first authenticated workspace layout retains `AppShell`, its skip link, primary navigation, and exactly one primary landmark in `tests/001-project-foundation/app-shell/dashboard-shell.test.tsx`.

### Implementation for User Story 3

- [X] T033 [US3] Ensure `bun run check` composes lint, `tsc --noEmit`, and one-shot Jest in a fail-fast offline sequence through `package.json`.
- [X] T034 [US3] Update the exact automated-gate, deliberate-failure, manual-browser-boundary, and production-build procedures in `specs/001-project-foundation/quickstart.md` and `README.md`.
- [X] T035 [US3] Run the complete offline check, capture its duration/result, and record it in `specs/001-project-foundation/implementation-handoff.md`.

**Checkpoint**: Contributors can use one command to detect foundation regressions without credentials, a live backend, or network access.

---

## Phase 6: User Story 4 - Prepare Safe Service Integration (Priority: P4)

**Goal**: Provide lazy, validated browser/server Supabase boundaries without shipping authentication, persistence, or a secret-bearing client.

**Independent Test**: With no configuration, render the shell successfully; exercise validators/factories with mocked SDKs and valid/invalid candidates to prove validation is lazy, safe, and no remote operation occurs.

### Tests for User Story 4

- [X] T036 [P] [US4] Write pure configuration tests for valid HTTPS/local inputs plus missing, blank, malformed, unsafe-protocol, and no-secret-message cases in `tests/supabase/supabase-config.test.ts`.
- [X] T037 [P] [US4] Write mocked lazy browser-factory/import-boundary tests in `tests/supabase/browser-client.test.ts`.
- [X] T038 [P] [US4] Write Node-environment mocked cookie-adapter and lazy server-factory tests in `tests/supabase/server-client.test.ts`.
- [X] T039 [P] [US4] Add a shell-render no-fetch/no-Supabase-factory regression test in `tests/supabase/shell-boundary.test.tsx`.

### Implementation for User Story 4

- [X] T040 [US4] Install `@supabase/supabase-js`, `@supabase/ssr`, and `server-only`, then lock their resolved versions in `package.json` and `bun.lock`.
- [X] T041 [US4] Implement `PublicSupabaseConfig`, `SupabaseConfigurationError`, direct literal public environment reads, and safe URL/key validation in `lib/supabase/config.ts`.
- [X] T042 [US4] Implement the lazy client-only browser factory that validates at call time in `lib/supabase/client.ts`.
- [X] T043 [US4] Implement the server-only async factory using awaited Next.js `cookies()` plus `getAll`/`setAll` adapters in `lib/supabase/server.ts`.
- [X] T044 [US4] Verify no shell, layout, or route imports a Supabase factory; document deferred authentication, Proxy, RLS, schema, storage, admin-client, and service-role work in `README.md` and `specs/001-project-foundation/implementation-handoff.md`.
- [X] T045 [US4] Run focused Supabase tests without `.env.local` and record configuration/no-network evidence in `specs/001-project-foundation/implementation-handoff.md`.

**Checkpoint**: Future integration work has isolated factories and a safe public configuration contract, while the static shell remains independent of Supabase.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify the full implementation and preserve an auditable handoff.

- [X] T046 [P] Run `bun run check` and resolve lint, type, Jest, static-boundary, and accessibility failures across `package.json`, `tests/`, `components/`, `lib/`, and `app/`.
- [X] T047 Run `bun run build` using the installed Next.js version and resolve any build-time environment/configuration regression in `app/` or `lib/supabase/`.
- [X] T048 Perform and record the 320/375/768/1024/1440 CSS-pixel, 200% zoom, system-appearance, keyboard, and mobile-sidebar manual scenarios in `specs/001-project-foundation/implementation-handoff.md`.
- [X] T049 Finalize the generated-versus-retained/removed/renamed/fixed inventory, package changes, command results/durations, deferred work, and next steps in `specs/001-project-foundation/implementation-handoff.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** starts immediately. T004 and T005 must complete before any task that edits or tests generated shell files.
- **Foundational (Phase 2)** depends on the relevant setup work and blocks story implementation.
- **US1 (P1)** depends on Phase 2 and is the MVP.
- **US2 (P2)** depends on the productized shell from US1 because it demonstrates primitives within that shell.
- **US3 (P3)** may begin its regression tests after Phase 2, but its final gate depends on the delivered US1–US2 work.
- **US4 (P4)** depends on the test harness and may proceed after Phase 2; it must not be imported by US1 shell modules.
- **Polish** depends on the selected stories being complete.

### User Story Dependencies

- **US1**: No dependency on other user stories after Phase 2.
- **US2**: Uses the US1 shell as its representative composition host.
- **US3**: Verifies US1 and US2 behavior; its test scaffolding can start earlier.
- **US4**: Architecturally independent of the shell and intentionally has no runtime integration with it.

## Parallel Opportunities

- T006, T007, and T008 can proceed in parallel after the selected registry install path is known.
- T010–T012 can proceed in parallel; T009 updates shared CSS and should be coordinated with T022.
- Within US1, T014–T016 are independent test files; within US2, T024–T025 are independent; within US4, T036–T039 are independent.
- US3 regression-test work and US4 test/implementation work can proceed in parallel with US2 after the shared harness is ready, provided no one edits the same shared configuration file simultaneously.

## Parallel Example: User Story 4

```text
Task: "Write pure configuration tests in tests/supabase/supabase-config.test.ts"
Task: "Write browser-factory boundary tests in tests/supabase/browser-client.test.ts"
Task: "Write server-factory boundary tests in tests/supabase/server-client.test.ts"
Task: "Write no-call shell regression test in tests/supabase/shell-boundary.test.tsx"
```

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Setup and Foundational phases, including the mandatory registry audit.
2. Complete US1 tests and productize the installed Efferd shell.
3. Run the US1 suite with no `.env.local` and manually verify keyboard/mobile shell behavior.
4. Stop for a demonstrable SearchTrace foundation shell before adding further primitives or backend boundaries.

### Incremental Delivery

1. Setup + Foundational establishes ShadCN, tokens, scripts, and test support.
2. US1 delivers the usable shared shell.
3. US2 adds reusable pattern coverage.
4. US3 locks the foundation gate and contributor workflow.
5. US4 adds isolated future service boundaries without adding a live workflow.
6. Polish records real-browser checks and the third-party registry audit.

## Notes

- Every task uses the required checklist format with a sequential ID and exact target path.
- `[P]` indicates work that can be parallelized without editing the same incomplete file.
- No task authorizes auth flows, Proxy/middleware, schema/RLS/storage, admin/secret clients, data operations, or product workflows; those require a later feature specification.
