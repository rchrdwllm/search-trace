# Tasks: Opportunity Evidence-Gap Analysis

**Branch**: `010-evidence-gap-analysis`  
**Input**: Design artifacts from `specs/010-evidence-gap-analysis/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize test and component directories, shared Zod validation schemas, and AI service types.

- [X] T001 Create component and test directories under `components/analysis/` and `tests/010-evidence-gap-analysis/` (`boundaries/`, `ai/`, `procedures/`, `components/`)
- [X] T002 [P] Create shared Zod validation schemas and TypeScript types for evidence-gap analysis inputs, outputs, evaluations, and drafts in `lib/validations/analysis.ts`
- [X] T003 [P] Define `AiAnalyzerService` interfaces, evaluation options, and result contracts in `lib/ai/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema enhancement, Drizzle migration, and boundary isolation tests required before ANY user story can proceed.

**⚠️ CRITICAL**: Must be complete before implementing user story procedures and views.

- [X] T004 Add coverage and citation columns to `requirements` table, and analysis summary columns to `opportunities` table in `lib/db/schema.ts`
- [X] T005 Generate Drizzle SQL migration `0006_add_evidence_gap_analysis.sql` into `drizzle/` via `bun run db:generate -- --name add_evidence_gap_analysis`
- [X] T006 [P] Write static boundary tests asserting server-only boundaries, non-exposure of secrets, and schema constraints in `tests/010-evidence-gap-analysis/boundaries/analysis-boundary.test.ts`
- [X] T007 [P] Extend multi-source verbatim citation verification functions for résumé, evidence, and feedback texts in `lib/extraction/citation-verifier.ts`
- [X] T008 [P] Write citation verifier tests validating substring matching across candidate materials in `tests/010-evidence-gap-analysis/ai/citation-verifier.test.ts`

**Checkpoint**: Foundation ready — database schema, migration, validation contracts, boundary tests, and citation verification utilities complete.

---

## Phase 3: User Story 1 - Run Explainable Evidence-Gap Analysis with Verbatim Citations, Limitations, and One Next Action (Priority: P1) 🎯 MVP

**Goal**: Authenticated job seekers can trigger an automated structured analysis that evaluates approved requirements against reviewed résumé text and selected evidence, generating verified coverage states (`supported`, `weak`, `missing`, `unknown`), authentic verbatim citations, stated limitations, and exactly one bounded next action tied to a weak or missing requirement.

**Independent Test**: Trigger analysis for an opportunity with approved requirements and a reviewed résumé (with AI opt-in enabled), and verify that an uncommitted draft is generated with verified verbatim citations, stated limitations, and one bounded next action.

### Tests for User Story 1

- [X] T009 [P] [US1] Write unit tests for `InMemoryAiAnalyzer` and `GeminiAiAnalyzer` verifying coverage determination, verbatim citation enforcement, limitations, and single next action output in `tests/010-evidence-gap-analysis/ai/analyzer.test.ts`
- [X] T010 [P] [US1] Write procedure tests for `analysis.run` validating authorized input gathering, draft output format, and draft separation in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement deterministic `InMemoryAiAnalyzer` in `lib/ai/mock.ts` for offline test resilience and CI quality gates
- [X] T012 [US1] Implement `GeminiAiAnalyzer` using Vercel AI SDK `generateObject()` with Google Gemini 3.6 Flash in `lib/ai/analyzer.ts`
- [X] T013 [US1] Expose `getAiAnalyzerService()` factory and test provider switcher in `lib/ai/index.ts`
- [X] T014 [US1] Implement `analysis.run` procedure in `trpc/routers/analysis.ts` and mount `analysisRouter` in `trpc/routers/_app.ts`

**Checkpoint**: At this point, User Story 1 is functional: running an analysis generates a complete, uncommitted draft with verified citations and one bounded next action.

---

## Phase 4: User Story 2 - Transparent Pre-Flight Verification and Data Disclosure (Priority: P1)

**Goal**: Users observe complete transparency regarding which source materials (job description, reviewed résumé, attached evidence items, opted-in feedback) will be sent to the AI, with prerequisites enforced before execution.

**Independent Test**: Navigate to an opportunity ready for analysis, open the Pre-Flight Dialog, verify accurate counts and titles of included materials, confirm unselected library items are excluded, and confirm that missing prerequisites or disabled AI opt-in block execution with actionable guidance.

### Tests for User Story 2

- [X] T015 [P] [US2] Write procedure tests for `analysis.getPreFlight` validating prerequisite checks and included source summaries in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`
- [X] T016 [P] [US2] Write component tests for `AnalysisPreflightDialog` in `tests/010-evidence-gap-analysis/components/analysis-views.test.tsx`

### Implementation for User Story 2

- [X] T017 [US2] Implement `analysis.getPreFlight` procedure in `trpc/routers/analysis.ts`
- [X] T018 [US2] Implement accessible `AnalysisPreflightDialog` component with source inventory and data disclosure in `components/analysis/analysis-preflight-dialog.tsx`

**Checkpoint**: Pre-flight verification and data disclosure are fully operational, protecting user privacy and consent.

---

## Phase 5: User Story 3 - Review, Correct Coverage States, and Save Final Assessment (Priority: P1)

**Goal**: Users can interactively review the draft assessment in an uncommitted workspace, override any requirement's coverage state, edit citations and rationale, adjust the next action, and persist confirmed results to the database upon explicit confirmation.

**Independent Test**: Generate an analysis draft, override a `weak` requirement to `supported`, adjust its citation notes, click "Save Assessment", and verify that database records persist the confirmed states and the opportunity receives an updated analysis timestamp.

### Tests for User Story 3

- [X] T019 [P] [US3] Write procedure tests for `analysis.save` asserting persistence of confirmed states, citations, limitations, and next action in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`
- [X] T020 [P] [US3] Write component tests for `AnalysisDraftReview` verifying interactive overrides and discard behavior in `tests/010-evidence-gap-analysis/components/analysis-views.test.tsx`

### Implementation for User Story 3

- [X] T021 [US3] Implement `analysis.save` procedure in `trpc/routers/analysis.ts` updating `requirements` and `opportunities` tables
- [X] T022 [US3] Implement `AnalysisDraftReview` workspace component with live count recalculation, coverage state selectors, and action bar in `components/analysis/analysis-draft-review.tsx`

**Checkpoint**: Two-tier review workflow is complete: human-in-the-loop control is fully preserved before database persistence.

---

## Phase 6: User Story 4 - Inspect Opportunity Coverage Summary and Actionable Next Step (Priority: P2)

**Goal**: Users viewing an analyzed opportunity can inspect a clear summary showing deterministic coverage counts (`supported`, `weak`, `missing`, `unknown`), detailed requirement cards with coverage badges and verbatim citations, and a prominent Next Action card.

**Independent Test**: Navigate to an analyzed opportunity, verify that coverage counts match confirmed requirements, each requirement shows its coverage badge and cited source excerpt, and the Next Action card highlights the single improvement task with its honest AI disclaimer.

### Tests for User Story 4

- [X] T023 [P] [US4] Write procedure tests for `analysis.getSummary` in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`
- [X] T024 [P] [US4] Write component tests for `AnalysisCoverageSummary`, `AnalysisNextActionCard`, and `AnalysisRequirementItem` in `tests/010-evidence-gap-analysis/components/analysis-views.test.tsx`

### Implementation for User Story 4

- [X] T025 [US4] Implement `analysis.getSummary` procedure in `trpc/routers/analysis.ts`
- [X] T026 [P] [US4] Implement accessible `AnalysisCoverageSummary` component with deterministic count badges in `components/analysis/analysis-coverage-summary.tsx`
- [X] T027 [P] [US4] Implement accessible `AnalysisNextActionCard` component with honest AI disclaimer in `components/analysis/analysis-next-action-card.tsx`
- [X] T028 [P] [US4] Implement `AnalysisRequirementItem` component displaying coverage status and verbatim citations in `components/analysis/analysis-requirement-item.tsx`
- [X] T029 [US4] Implement `AnalysisSection` coordinator in `components/analysis/analysis-section.tsx` and integrate into `app/dashboard/opportunities/[opportunityId]/page.tsx`

**Checkpoint**: Opportunity analysis presentation is complete, providing explainable coverage counts and one clear next action.

---

## Phase 7: User Story 5 - Enforce Daily Analysis Quotas, Verifiable Citations, and Private Data Isolation (Priority: P1)

**Goal**: Enforce strict daily usage limits (5 requests/user/day), verify citation authenticity against source text, safeguard private data across user boundaries, and ensure failures leave source data unmodified.

**Independent Test**: Attempt a 6th analysis request on the same day and verify rejection with quota guidance; attempt cross-user analysis and verify non-enumerating 404; simulate AI failure and verify source records remain untouched.

### Tests for User Story 5

- [X] T030 [P] [US5] Write procedure tests for daily limit enforcement (5 requests/day), quota exhaustion, and reset timestamp in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`
- [X] T031 [P] [US5] Write procedure tests for cross-user isolation and non-enumeration (`unavailableResource()`) across all analysis procedures in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`
- [X] T032 [P] [US5] Write resilience tests ensuring provider errors, timeouts, and quota blocks leave source records unmodified in `tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts`

### Implementation for User Story 5

- [X] T033 [US5] Implement `analysis.getDailyUsage` procedure and integrate daily rate limiting check/increment in `trpc/routers/analysis.ts`
- [X] T034 [US5] Implement quota warning banner and reset notification in `components/analysis/analysis-section.tsx`
- [X] T035 [US5] Implement plain-text sanitization and operational log exclusion for all analysis payload processing in `trpc/routers/analysis.ts` and `lib/ai/analyzer.ts`

**Checkpoint**: All security, quota, citation integrity, and isolation invariants are strictly verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate verification, accessibility compliance, documentation updates, and manual walkthrough validation.

- [X] T036 [P] Update `AGENTS.md` and repository documentation to reflect evidence-gap analysis subsystems and procedures
- [X] T037 Run complete automated quality gate (`bun run check`: ESLint + strict typecheck + Jest test suite) and verify zero errors
- [X] T038 Execute manual validation scenarios defined in `specs/010-evidence-gap-analysis/quickstart.md`

---

## Phase 9: Convergence

**Purpose**: Implement supporting evidence enhancements: sourceUrl propagation, systematic AI cross-referencing, and evidence contribution indicators in the UI.

- [X] T039 Add `sourceUrl` to `evidenceItems` in `AnalyzeOpportunityEvidenceOptions` and format into AI prompt in `lib/ai/types.ts`, `trpc/routers/analysis.ts`, and `lib/ai/analyzer.ts` per FR-024
- [X] T040 Enhance AI analyzer prompt and mock logic to systematically cross-reference and cite attached evidence per FR-023 and US1/AC10 in `lib/ai/analyzer.ts` and `lib/ai/mock.ts`
- [X] T041 Add evidence contribution and utilization indicators to analysis summary and draft review components per FR-024 and US4/AC5 in `components/analysis/analysis-coverage-summary.tsx` and `components/analysis/analysis-draft-review.tsx`
- [X] T042 Render external project links for evidence citations in `AnalysisRequirementItem` per FR-024 in `components/analysis/analysis-requirement-item.tsx`
- [X] T043 Add automated tests for evidence cross-referencing, sourceUrl propagation, and evidence contribution views per SC-002 and SC-005 in `tests/010-evidence-gap-analysis/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3 - P1 MVP)**: Depends on Foundational completion.
- **User Story 2 (Phase 4 - P1)**: Depends on Foundational completion; integrates with US1 analysis trigger.
- **User Story 3 (Phase 5 - P1)**: Depends on US1 draft output and Foundational schema updates.
- **User Story 4 (Phase 6 - P2)**: Depends on US3 persistence and US1/US2 coordinator.
- **User Story 5 (Phase 7 - P1)**: Depends on `analysisRouter` implementation in US1–US4.
- **Polish (Phase 8)**: Depends on all user stories being complete.

---

## Parallel Execution Opportunities

- Setup tasks `T002` and `T003` can execute in parallel.
- Foundational tasks `T006`, `T007`, and `T008` can execute in parallel once `T004` and `T005` complete.
- Test tasks `T009` and `T010` can run in parallel before implementation.
- Component implementations `T026`, `T027`, and `T028` in User Story 4 can proceed concurrently.
- Security and quota tests `T030`, `T031`, and `T032` can be written in parallel.

---

## Implementation Strategy: MVP First

1. **Phase 1 & 2**: Complete setup, database schema changes, Drizzle migration, boundary tests, and citation verifier.
2. **Phase 3 (User Story 1 MVP)**: Build `AiAnalyzerService` (`GeminiAiAnalyzer` + `InMemoryAiAnalyzer`) and `analysis.run`. Test that an opportunity can generate an explainable draft with verified citations and one bounded next action.
3. **Phase 4 & 5**: Add Pre-Flight transparency dialog (`US2`) and Draft Review / Save workspace (`US3`).
4. **Phase 6 & 7**: Add Coverage Summary display, Next Action card (`US4`), and enforce daily quotas and isolation (`US5`).
5. **Phase 8**: Run full quality gate (`bun run check`) and execute quickstart validation scenarios.
