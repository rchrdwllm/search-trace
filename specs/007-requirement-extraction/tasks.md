# Tasks: Requirement Extraction from Job Description (Vercel AI SDK + Gemini 3.6 Flash)

**Branch**: `007-requirement-extraction`  
**Input**: Design artifacts from `specs/007-requirement-extraction/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize packages, directory structure, and shared validation schemas for AI-powered requirement extraction.

- [X] T001 Install Vercel AI SDK and Google AI provider dependencies via `bun add ai @ai-sdk/google`
- [X] T002 [P] Create test and component directories under `tests/007-requirement-extraction/` (`boundaries/`, `extraction/`, `ai/`, `procedures/`, `components/`) and `components/requirements/`
- [X] T003 [P] Create shared Zod validation schemas for requirements and extraction inputs in `lib/validations/requirement.ts`
- [X] T004 [P] Document `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL=gemini-3.6-flash`, and `AI_PROVIDER` in `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, citation verification service, rate limiter, and Vercel AI SDK client infrastructure required before ANY user story can proceed.

**⚠️ CRITICAL**: Must be completed before implementing user story procedures and views.

- [X] T005 Add `requirements` and `user_daily_usage` tables schema with foreign keys and indexes in `lib/db/schema.ts`
- [X] T006 Generate Drizzle migration for the new tables into `drizzle/` via `bun run db:generate -- --name add_requirements_table`
- [X] T007 [P] Implement server-side verbatim citation verification algorithm in `lib/extraction/citation-verifier.ts`
- [X] T008 [P] Write unit tests for citation verification (exact substring, whitespace normalization, CRLF handling, and hallucination rejection) in `tests/007-requirement-extraction/extraction/citation-verifier.test.ts`
- [X] T009 [P] Implement daily rate limiter (5 requests/user/day with UTC midnight reset) in `lib/ai/rate-limiter.ts`
- [X] T010 [P] Write unit tests for daily rate limiter in `tests/007-requirement-extraction/ai/rate-limiter.test.ts`
- [X] T011 [P] Define `AiExtractorService` interface and result types in `lib/ai/types.ts`
- [X] T012 [P] Implement production Vercel AI SDK extractor with `generateObject()` and `@ai-sdk/google` (`gemini-3.6-flash`) in `lib/ai/gemini.ts`
- [X] T013 [P] Implement `InMemoryAiExtractor` fixture provider for offline testing and development in `lib/ai/mock.ts`
- [X] T014 Implement AI provider factory with offline memory fallback in `lib/ai/index.ts`
- [X] T015 Write unit tests for Vercel AI SDK schema generation and mock extractor in `tests/007-requirement-extraction/ai/gemini-extractor.test.ts`

**Checkpoint**: Core extraction, citation verification, rate limiting, and database foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Extract Draft Requirements with Verbatim Job Description Citations (Priority: P1) 🎯 MVP

**Goal**: An authenticated job seeker can trigger automated requirement extraction on an opportunity; the system extracts 5–12 draft requirements using Vercel AI SDK + Gemini 3.6 Flash, validates that every citation is an exact verbatim substring from the job description, enforces the 5/day quota, and displays reviewable draft cards without modifying database records.

**Independent Test**: Navigate to an opportunity with a job description; click "Extract Requirements from Job Description"; observe loading state, quota decrement, and 5–12 draft requirement cards displaying category badges and exact job-description citations, flanked by the "Reviewing Draft Requirements (Unsaved)" banner.

### Tests for User Story 1

- [X] T016 [P] [US1] Write procedure tests for `requirement.extract` and `requirement.getDailyUsage` in `tests/007-requirement-extraction/procedures/requirement-router.test.ts`
- [X] T017 [P] [US1] Write component tests for `RequirementDraftBanner`, `RequirementQuotaAlert`, and `RequirementCard` in `tests/007-requirement-extraction/components/requirement-section.test.tsx`

### Implementation for User Story 1

- [X] T018 [US1] Implement `requirement.extract` and `requirement.getDailyUsage` procedures in `trpc/routers/requirement.ts` and register router in `trpc/routers/_app.ts`
- [X] T019 [US1] Implement `RequirementQuotaAlert` component displaying remaining extractions or limit alert in `components/requirements/requirement-quota-alert.tsx`
- [X] T020 [US1] Implement `RequirementDraftBanner` component with Save and Discard actions in `components/requirements/requirement-draft-banner.tsx`
- [X] T021 [US1] Implement `RequirementCard` component displaying title, category badge, and cited excerpt blockquote in `components/requirements/requirement-card.tsx`
- [X] T022 [US1] Implement `RequirementEmptyState` component with call-to-action in `components/requirements/requirement-empty-state.tsx`
- [X] T023 [US1] Implement coordinator `RequirementSection` managing extraction mutations and draft state in `components/requirements/requirement-section.tsx`
- [X] T024 [US1] Embed `RequirementSection` into opportunity detail view in `app/dashboard/opportunities/[opportunityId]/page.tsx`

**Checkpoint**: User Story 1 is fully functional: a user can extract draft requirements with verified verbatim citations and inspect them in an uncommitted draft state.

---

## Phase 4: User Story 2 - Review, Edit, and Save Requirements (Priority: P1)

**Goal**: An authenticated user can inspect draft requirements, edit titles, change categories, update cited excerpts with live verification, and save the confirmed requirement set to the database.

**Independent Test**: Review extracted draft requirements; open edit dialog to modify title, category, and citation; click "Save Requirements"; verify requirements persist in the database and reload accurately.

### Tests for User Story 2

- [X] T025 [P] [US2] Write procedure tests for `requirement.save` and `requirement.listByOpportunityId` in `tests/007-requirement-extraction/procedures/requirement-router.test.ts`
- [X] T026 [P] [US2] Write component tests for `RequirementEditDialog` and save workflow in `tests/007-requirement-extraction/components/requirement-section.test.tsx`

### Implementation for User Story 2

- [X] T027 [US2] Implement `requirement.listByOpportunityId` query and `requirement.save` mutation with citation validation in `trpc/routers/requirement.ts`
- [X] T028 [US2] Implement accessible `RequirementEditDialog` component with live citation verification in `components/requirements/requirement-edit-dialog.tsx`
- [X] T029 [US2] Wire `RequirementEditDialog`, draft discard action, and `requirement.save` mutation into `components/requirements/requirement-section.tsx`

**Checkpoint**: Requirements review, editing, and persistence are functional and testable independently.

---

## Phase 5: User Story 3 - Add and Delete Individual Requirements Manually (Priority: P2)

**Goal**: An authenticated user can manually add custom requirements (with optional verified citations) and delete unwanted draft or saved requirements.

**Independent Test**: On the requirement list, click "Add Requirement" to create a custom requirement; verify it appears; delete an unwanted requirement; verify the list count updates immediately.

### Tests for User Story 3

- [X] T030 [P] [US3] Write procedure tests for `requirement.delete` in `tests/007-requirement-extraction/procedures/requirement-router.test.ts`
- [X] T031 [P] [US3] Write component tests for `RequirementAddDialog` and deletion interactions in `tests/007-requirement-extraction/components/requirement-section.test.tsx`

### Implementation for User Story 3

- [X] T032 [US3] Implement `requirement.delete` mutation in `trpc/routers/requirement.ts`
- [X] T033 [US3] Implement accessible `RequirementAddDialog` component in `components/requirements/requirement-add-dialog.tsx`
- [X] T034 [US3] Integrate manual add dialog and item deletion into `components/requirements/requirement-section.tsx`

**Checkpoint**: Manual requirement addition and item deletion operational.

---

## Phase 6: User Story 4 - Re-extract Requirements with Replacement Confirmation (Priority: P2)

**Goal**: An authenticated user can re-trigger requirement extraction on an opportunity that already has saved requirements, safeguarded by an explicit replacement confirmation modal.

**Independent Test**: On an opportunity with existing saved requirements, click "Re-extract"; verify confirmation dialog appears; confirm overwrite $\to$ verify new draft requirements are extracted; cancel $\to$ verify existing requirements remain untouched.

### Tests for User Story 4

- [X] T035 [P] [US4] Write component tests for `RequirementReextractDialog` confirmation and cancellation flows in `tests/007-requirement-extraction/components/requirement-section.test.tsx`

### Implementation for User Story 4

- [X] T036 [US4] Implement accessible `RequirementReextractDialog` confirmation modal in `components/requirements/requirement-reextract-dialog.tsx`
- [X] T037 [US4] Integrate re-extraction confirmation modal into `components/requirements/requirement-section.tsx`

**Checkpoint**: Re-extraction replacement workflows safeguarded with explicit confirmation.

---

## Phase 7: User Story 5 - Enforce Privacy, Owner Isolation, and Safe Display (Priority: P1)

**Goal**: Verify that requirements are strictly isolated by owner, cross-user attempts return generic unavailable responses, all content renders as sanitized plain text, and operational logs exclude sensitive text.

**Independent Test**: Attempt cross-user tRPC procedure calls (`extract`, `list`, `save`, `delete`) and verify HTTP 404 `unavailableResource()` responses; assert static module boundaries.

### Tests for User Story 5

- [X] T038 [P] [US5] Implement static boundary assertions in `tests/007-requirement-extraction/boundaries/requirement-boundary.test.ts`
- [X] T039 [P] [US5] Write cross-user ownership and non-enumeration denial tests in `tests/007-requirement-extraction/procedures/requirement-router.test.ts`
- [X] T040 [P] [US5] Run accessibility audit (`jest-axe`) on all requirement components in `tests/007-requirement-extraction/components/requirement-section.test.tsx`

### Implementation for User Story 5

- [X] T041 [US5] Ensure all requirement tRPC procedures enforce `ctx.actorId` ownership checks and return `unavailableResource()` for unauthorized requests in `trpc/routers/requirement.ts`
- [X] T042 [US5] Verify all requirement text, categories, and citations are rendered as sanitized plain text elements across all requirement components in `components/requirements/`
- [X] T043 [US5] Ensure server logs exclude raw job descriptions, prompts, and model completions across `lib/ai/` and `trpc/routers/requirement.ts`

**Checkpoint**: Privacy, non-enumeration, log sanitization, and accessibility verified.

---

## Phase 8: Polish, Documentation & PRD Updates

**Purpose**: Update architectural documentation, PRD, and repository guides to reflect the Vercel AI SDK + Gemini 3.6 Flash integration, and run the quality gate.

- [X] T044 [P] Update `docs/prd/prd.md` to explicitly specify Vercel AI SDK and Google Gemini 3.6 Flash under Working Stack and Section 3 (AI System Requirements)
- [X] T045 [P] Update `AGENTS.md` Technology Stack table and Section 6 Subsystems to document Vercel AI SDK (`ai`, `@ai-sdk/google`) and Gemini 3.6 Flash
- [X] T046 Run `quickstart.md` validation scenarios end-to-end
- [X] T047 Run full verification quality gate via `bun run check` (ESLint 9 + TypeScript strict + one-shot Jest test suite)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (Phase 3 - MVP)**: Depends on Phase 2 — establishes the core extraction and draft presentation.
- **User Story 2 (Phase 4)**: Depends on Phase 3 — adds persistence and editing to draft requirements.
- **User Story 3 (Phase 5)**: Depends on Phase 4 — adds manual requirement additions and deletions.
- **User Story 4 (Phase 6)**: Depends on Phase 4 — adds re-extraction confirmation modal.
- **User Story 5 (Phase 7)**: Can run in parallel with or after Phase 3–6 — verifies security boundaries, non-enumeration, and accessibility.
- **Polish & Docs (Phase 8)**: Depends on Phase 1–7.

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel.
- **Phase 2**: T007, T008, T009, T010, T011, T012, T013 can be implemented in parallel.
- **Phase 3**: Tests (T016, T017) can be authored in parallel; UI components (T019, T020, T021, T022) can be built in parallel.
- **Phase 4**: Tests (T025, T026) can run in parallel; Dialog and mutation (T027, T028) can be built in parallel.
- **Phase 5**: T030, T031 can run in parallel.
- **Phase 6**: T035 can run in parallel.
- **Phase 7**: T038, T039, T040 can run in parallel.
- **Phase 8**: T044, T045 can run in parallel.

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational: schema, migration, citation verifier, mock & Vercel AI SDK extractor).
2. Complete Phase 3 (User Story 1: extraction procedure and uncommitted draft review UI).
3. **Validate MVP**: Test automated extraction from a job description, verify verbatim quotes, and inspect draft UI.

### Incremental Delivery (Phases 4 through 8)
1. Add Phase 4 (User Story 2: edit dialog and database save mutation).
2. Add Phase 5 (User Story 3: manual add and delete).
3. Add Phase 6 (User Story 4: re-extraction confirmation).
4. Add Phase 7 (User Story 5: security boundaries and accessibility audit).
5. Complete Phase 8 (Documentation updates to `docs/prd/prd.md` and `AGENTS.md`, and execute `bun run check`).
