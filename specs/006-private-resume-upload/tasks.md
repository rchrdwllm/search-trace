# Tasks: Private Résumé Upload and Review

**Branch**: `006-private-resume-upload`
**Input**: Design artifacts from `specs/006-private-resume-upload/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize directory structure, packages, and shared validation schemas for résumé upload and review.

- [X] T001 Create test and component directories under `tests/006-private-resume-upload/` (`db/`, `extraction/`, `storage/`, `routes/`, `procedures/`, `components/`, `boundaries/`) and `components/resumes/`
- [X] T002 Add `unpdf` and `mammoth` parsing dependencies via `bun add unpdf mammoth`
- [X] T003 [P] Create shared Zod validation schemas for résumés in `lib/validations/resume.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, storage services, magic byte inspection, and text extraction parsers required before ANY user story can proceed.

**⚠️ CRITICAL**: Must be completed before implementing user story procedures and views.

- [X] T004 Add `resumes` table schema with foreign keys to `opportunities.id` (unique) and `user.id` in `lib/db/schema.ts`
- [X] T005 [P] Write database schema and constraint unit tests in `tests/006-private-resume-upload/db/schema.test.ts`
- [X] T006 Generate Drizzle migration for the `resumes` table into `drizzle/` via `bun run db:generate -- --name add_resumes_table`
- [X] T007 [P] Implement magic byte signature inspection for PDF (`%PDF-`) and DOCX (`PK\x03\x04`) in `lib/extraction/magic-bytes.ts`
- [X] T008 [P] Implement server-side text extraction service with `unpdf` and `mammoth` in `lib/extraction/parser.ts`
- [X] T009 [P] Write unit tests for magic byte validator and text extraction parsers in `tests/006-private-resume-upload/extraction/text-extraction.test.ts`
- [X] T010 Implement `ResumeStorageService` interface, `SupabaseResumeStorage`, and `InMemoryResumeStorage` in `lib/storage/resume.ts`
- [X] T011 Write unit tests for private storage paths, signed URLs, and cleanup in `tests/006-private-resume-upload/storage/resume-storage.test.ts`

**Checkpoint**: Core extraction, storage, and database foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Upload a Résumé File for an Opportunity (Priority: P1) 🎯 MVP

**Goal**: An authenticated job seeker can upload a valid PDF or DOCX résumé (up to 10 MB) attached to an opportunity, storing it securely in private storage and initiating server-side text extraction.

**Independent Test**: Upload a valid PDF résumé on an opportunity with no prior résumé; verify the file is stored in private storage, recorded in the database with extraction state `pending` or `ready`, and rendered on the page.

### Tests for User Story 1

- [X] T012 [P] [US1] Write route tests for multipart binary upload (`POST /api/opportunities/[opportunityId]/resume`) in `tests/006-private-resume-upload/routes/upload-route.test.ts`
- [X] T013 [P] [US1] Write procedure tests for `resume.getByOpportunityId` in `tests/006-private-resume-upload/procedures/resume-router.test.ts`
- [X] T014 [P] [US1] Write component tests for `ResumeUploadDropzone` and `ResumeCard` in `tests/006-private-resume-upload/components/resume-section.test.tsx`

### Implementation for User Story 1

- [X] T015 [US1] Implement binary upload Route Handler in `app/api/opportunities/[opportunityId]/resume/route.ts` validating session, opportunity ownership, file size (≤ 10 MB), and magic bytes
- [X] T016 [US1] Implement `resume.getByOpportunityId` query in `trpc/routers/resume.ts` and register router in `trpc/routers/_app.ts`
- [X] T017 [US1] Implement `ResumeUploadDropzone` component in `components/resumes/resume-upload-dropzone.tsx`
- [X] T018 [US1] Implement `ResumeCard` component in `components/resumes/resume-card.tsx`
- [X] T019 [US1] Implement coordinator `ResumeSection` in `components/resumes/resume-section.tsx`
- [X] T020 [US1] Embed `ResumeSection` into opportunity detail view in `app/dashboard/opportunities/[opportunityId]/page.tsx`

**Checkpoint**: At this point, User Story 1 is functional: a user can upload a résumé to an opportunity and view its metadata and initial status.

---

## Phase 4: User Story 2 - Review and Edit Extracted Résumé Text (Priority: P1)

**Goal**: An authenticated user can inspect the plain text extracted from their résumé and edit it before analysis, ensuring human review and control over source materials.

**Independent Test**: View an opportunity with a completed extraction; edit the plain text in the review editor, save changes; verify the edited text is saved and persisted across reloads.

### Tests for User Story 2

- [X] T021 [P] [US2] Write tests for `resume.updateReviewedText` procedure in `tests/006-private-resume-upload/procedures/resume-router.test.ts`
- [X] T022 [P] [US2] Write component tests for `ResumeReviewEditor` in `tests/006-private-resume-upload/components/resume-section.test.tsx`

### Implementation for User Story 2

- [X] T023 [US2] Implement `resume.updateReviewedText` mutation in `trpc/routers/resume.ts`
- [X] T024 [US2] Implement accessible `ResumeReviewEditor` component with word/character count in `components/resumes/resume-review-editor.tsx`
- [X] T025 [US2] Integrate `ResumeReviewEditor` into `components/resumes/resume-section.tsx`

**Checkpoint**: Extracted text review and editing are fully functional and testable independently.

---

## Phase 5: User Story 3 - Download Current Résumé via Short-Lived Secure Link (Priority: P2)

**Goal**: An authenticated owner can download their uploaded résumé file through a short-lived (60-second) signed URL without exposing the private storage bucket.

**Independent Test**: Click "Download" on an uploaded résumé card; verify an authenticated signed URL is generated and the document downloads or opens safely.

### Tests for User Story 3

- [X] T026 [P] [US3] Write tests for `resume.getDownloadUrl` procedure in `tests/006-private-resume-upload/procedures/resume-router.test.ts`

### Implementation for User Story 3

- [X] T027 [US3] Implement `resume.getDownloadUrl` mutation in `trpc/routers/resume.ts`
- [X] T028 [US3] Wire download action into `components/resumes/resume-card.tsx`

**Checkpoint**: Secure authenticated document downloads operational.

---

## Phase 6: User Story 4 - Replace an Existing Résumé with Confirmation (Priority: P2)

**Goal**: An authenticated user can replace an existing résumé with a new file after explicit confirmation in an accessible modal dialog, purging the old storage file and resetting extracted text.

**Independent Test**: Trigger "Replace" on an existing résumé, confirm dialog; verify old storage object is deleted, new file is uploaded, and extraction state restarts.

### Tests for User Story 4

- [X] T029 [P] [US4] Write tests for replacement cleanup in `tests/006-private-resume-upload/routes/upload-route.test.ts`
- [X] T030 [P] [US4] Write component tests for `ResumeReplaceDialog` in `tests/006-private-resume-upload/components/resume-section.test.tsx`

### Implementation for User Story 4

- [X] T031 [US4] Implement `ResumeReplaceDialog` component in `components/resumes/resume-replace-dialog.tsx`
- [X] T032 [US4] Integrate replacement dialog and re-upload flow into `components/resumes/resume-section.tsx`

**Checkpoint**: Single-résumé invariant preserved during document replacement.

---

## Phase 7: User Story 5 - Delete an Uploaded Résumé with Confirmation (Priority: P2)

**Goal**: An authenticated user can permanently delete an uploaded résumé after explicit confirmation in an accessible modal dialog, purging the storage object and database record.

**Independent Test**: Trigger "Delete" on an existing résumé, confirm dialog; verify the storage object and database record are permanently removed and dropzone returns to empty state.

### Tests for User Story 5

- [X] T033 [P] [US5] Write tests for `resume.delete` mutation in `tests/006-private-resume-upload/procedures/resume-router.test.ts`
- [X] T034 [P] [US5] Write component tests for `ResumeDeleteDialog` in `tests/006-private-resume-upload/components/resume-section.test.tsx`

### Implementation for User Story 5

- [X] T035 [US5] Implement `resume.delete` mutation with ownership verification in `trpc/routers/resume.ts`
- [X] T036 [US5] Implement `ResumeDeleteDialog` component in `components/resumes/resume-delete-dialog.tsx`
- [X] T037 [US5] Integrate deletion flow into `components/resumes/resume-section.tsx`

**Checkpoint**: Clean document deletion and storage cleanup verified.

---

## Phase 8: User Story 6 - Handle Text Extraction Failures and Provide Explicit Retry (Priority: P2)

**Goal**: Provide clear visibility into extraction failures (corrupt files, image-only scanned PDFs) with guidance on OCR non-goals, a retry action, and manual text entry fallback.

**Independent Test**: Upload an unextractable document; verify `failed` state is displayed with an informative alert, click "Retry" to re-extract, or manually enter plain text to transition to `ready`.

### Tests for User Story 6

- [X] T038 [P] [US6] Write tests for `resume.retryExtraction` and manual text fallback in `tests/006-private-resume-upload/procedures/resume-router.test.ts`
- [X] T039 [P] [US6] Write component tests for `ResumeExtractionAlert` in `tests/006-private-resume-upload/components/resume-section.test.tsx`

### Implementation for User Story 6

- [X] T040 [US6] Implement `resume.retryExtraction` mutation in `trpc/routers/resume.ts`
- [X] T041 [US6] Implement `ResumeExtractionAlert` component with retry button and manual text fallback in `components/resumes/resume-extraction-alert.tsx`
- [X] T042 [US6] Integrate failure handling and retry mechanisms into `components/resumes/resume-section.tsx`

**Checkpoint**: Failure handling, retry mechanisms, and manual fallback operational.

---

## Phase 9: User Story 7 - Enforce Privacy, Owner-Only Access, and Explicit AI Opt-In (Priority: P1)

**Goal**: Ensure strict tenant isolation, non-enumeration error handling (`unavailableResource()`), and an explicit per-opportunity AI consent toggle that defaults to OFF.

**Independent Test**: Verify AI consent toggle is default-off; toggle consent and confirm persistence; attempt cross-user access to another user's résumé and confirm `NOT_FOUND` response with 0 data leakage.

### Tests for User Story 7

- [X] T043 [P] [US7] Write cross-user ownership isolation and non-enumeration tests in `tests/006-private-resume-upload/procedures/resume-router.test.ts` and `tests/006-private-resume-upload/routes/upload-route.test.ts`
- [X] T044 [P] [US7] Write static boundary tests in `tests/006-private-resume-upload/boundaries/resume-boundary.test.ts` asserting no server-only leaks in client components

### Implementation for User Story 7

- [X] T045 [US7] Implement `resume.setAiOptIn` mutation in `trpc/routers/resume.ts`
- [X] T046 [US7] Implement `ResumeAiConsentToggle` component in `components/resumes/resume-ai-consent-toggle.tsx`
- [X] T047 [US7] Integrate `ResumeAiConsentToggle` into `components/resumes/resume-section.tsx`

**Checkpoint**: Privacy, consent controls, and authorization boundaries verified.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility validation, static boundary enforcement, full quality gate execution, and walkthrough validation.

- [X] T048 [P] Write automated accessibility tests with `jest-axe` across all résumé components in `tests/006-private-resume-upload/components/resume-accessibility.test.tsx`
- [X] T049 Verify no sensitive data or raw document text is logged across route handlers and procedures
- [X] T050 Run full quality gate (`bun run check`) and execute quickstart scenarios per `specs/006-private-resume-upload/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story phases.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (US1 upload provides the extracted text to edit).
- **User Story 3 (Phase 5)**: Depends on Phase 3 (US1 upload provides the file to download).
- **User Story 4 (Phase 6)**: Depends on Phase 3 and Phase 4.
- **User Story 5 (Phase 7)**: Depends on Phase 3.
- **User Story 6 (Phase 8)**: Depends on Phase 3 and Phase 4.
- **User Story 7 (Phase 9)**: Depends on Phase 3 and Phase 4.
- **Polish (Phase 10)**: Depends on all user stories being implemented.

### Parallel Execution Opportunities

- `T003` (validations schema) can run in parallel with `T001` (test directories) in Phase 1.
- `T005` (db tests), `T007` (magic bytes), `T008` (parser), and `T009` (parser tests) can run in parallel in Phase 2.
- In each user story phase, test authoring (`[P]`) can proceed alongside UI component creation.
- `T043` (cross-user tests) and `T044` (static boundary tests) can run in parallel in Phase 9.
- `T048` (accessibility tests) can run across all components in parallel.

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete Setup and Foundational phases (schema, migration, storage service, parser, magic byte checks).
2. Implement User Story 1 (`POST /api/opportunities/[opportunityId]/resume`, `resume.getByOpportunityId`, `ResumeUploadDropzone`, `ResumeCard`).
3. **Validate**: Verify upload, private storage placement, and automatic text extraction independently.

### Incremental Feature Expansion
1. Add User Story 2: Review and edit plain text with word/character counts.
2. Add User Story 3: Authenticated signed download links.
3. Add User Story 4: Replacement flow with confirmation dialog and prior storage cleanup.
4. Add User Story 5: Deletion flow with confirmation dialog.
5. Add User Story 6: Extraction failure handling, retry button, and manual text paste fallback.
6. Add User Story 7: Default-off AI consent toggle and cross-user authorization tests.
7. Complete Polish: Automated `jest-axe` accessibility tests, static boundaries, and `bun run check`.
