# Feature Specification: Private Résumé Upload and Review

**Feature Branch**: `feat/opportunity-management` (no specification hook created a feature branch)

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "let's implement private resume upload: Story 3 — Upload and review the résumé used for an opportunity. Refer to @[docs/prd/prd.md] for more details."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload a Résumé File for an Opportunity (Priority: P1)

As a signed-in job seeker, I want to upload the specific résumé file (PDF or DOCX, up to 10 MB) that I used when applying for a targeted opportunity, so that the assessment evaluates the exact qualifications and experience I submitted.

**Why this priority**: Attaching the submitted résumé to an opportunity is the core prerequisite for text extraction, evidence comparison, and requirement verification.

**Independent Test**: Navigate to an existing opportunity, select a valid PDF or DOCX file under 10 MB, upload it, and observe that the file is accepted, validated, securely stored in the private workspace, and marked as pending/processing extraction.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an opportunity with no uploaded résumé, **When** they select a valid PDF or DOCX file (≤ 10 MB) and initiate upload, **Then** the system securely saves the file in private storage scoped to the user and opportunity, records file metadata (name, type, size, timestamp), and initiates extraction.
2. **Given** an authenticated user attempting to upload an unsupported file format (e.g., TXT, PNG, DOC, ZIP, or EXE), **When** they select the file, **Then** the system immediately blocks the upload, highlights the error with clear guidance specifying only PDF and DOCX formats are accepted, and leaves existing records unchanged.
3. **Given** an authenticated user attempting to upload a file exceeding the 10 MB limit, **When** they attempt to upload, **Then** the system rejects the file, notifies the user that files must be 10 MB or smaller, and preserves the opportunity in its prior state.
4. **Given** an upload in progress, **When** network interruption or transfer failure occurs, **Then** the system informs the user of the transmission failure and permits them to reselect or re-attempt the upload without leaving orphaned or corrupt partial records.

---

### User Story 2 - Review and Edit Extracted Résumé Text (Priority: P1)

As a signed-in job seeker, I want to review the plain text extracted from my résumé and make manual corrections or edits before any analysis occurs, so that formatting glitches or extraction errors do not misrepresent my background.

**Why this priority**: In accordance with Constitution Principle II (Human Review and Control) and Principle I (Evidence Before Inference), users must have full visibility and editing control over extracted evidence before it can be used for downstream analysis.

**Independent Test**: Open an opportunity where a résumé has completed extraction; review the plain text extracted from the document in an editable text area, make edits (such as fixing spacing, typos, or section headers), save the edited text, and verify the saved text persists.

**Acceptance Scenarios**:

1. **Given** a résumé with completed extraction, **When** the user views the opportunity, **Then** the system displays the extracted text in an editable plain-text review area alongside the filename, file size, and upload date.
2. **Given** an opportunity with extracted résumé text, **When** the user edits the text and saves changes, **Then** the system persists the updated text as the reviewed résumé content to be used in evidence analysis.
3. **Given** an opportunity with edited résumé text, **When** the user reverts or discards unsaved changes, **Then** the review area restores the previously saved text without altering the stored record.
4. **Given** a résumé document containing styling, links, or complex layouts, **When** extracted, **Then** the extracted and reviewed representation is strictly plain text with preserved line breaks and paragraph spacing, with zero script execution risk.

---

### User Story 3 - Download the Current Résumé via a Short-Lived Secure Link (Priority: P2)

As a signed-in job seeker, I want to download or view the original résumé file I uploaded for an opportunity via an authenticated, temporary link so that I can inspect the exact document on record without exposing it to the public internet.

**Why this priority**: Job seekers often tailor different résumés to different roles and need to verify which version they uploaded, while maintaining strict document privacy.

**Independent Test**: Click the download action on an opportunity with an uploaded résumé; verify that the file downloads or opens via a short-lived authenticated URL, and confirm that an unauthenticated user or third party cannot access or guess the URL.

**Acceptance Scenarios**:

1. **Given** an authenticated owner viewing their opportunity with an uploaded résumé, **When** they click the download button, **Then** the system generates a temporary, short-lived authenticated link that allows downloading the original file with its original filename.
2. **Given** an expired download link or an unauthenticated request to a download link, **When** accessed, **Then** the storage provider rejects access and returns an unauthorized response.
3. **Given** an authenticated user attempting to request a download link for a résumé belonging to another user's opportunity, **When** the request is made, **Then** the system denies access with a generic unavailable response.

---

### User Story 4 - Replace an Existing Résumé with Confirmation (Priority: P2)

As a signed-in job seeker, I want to replace the current résumé on an opportunity with an updated version after explicit confirmation, so that I can update my submission if I made an error or updated my credentials.

**Why this priority**: Users occasionally attach the wrong version of a résumé or revise their application; supporting clean replacement without accumulating obsolete versions maintains the single-résumé-per-opportunity invariant.

**Independent Test**: On an opportunity with an existing résumé, trigger replacement with a new PDF/DOCX file, confirm the prompt, and verify that the old file is permanently deleted from storage, the new file is stored, extraction is re-run, and previous AI opt-in consent is reset to off.

**Acceptance Scenarios**:

1. **Given** an opportunity with an existing uploaded résumé, **When** the user selects a new valid résumé file to upload, **Then** the system displays an explicit confirmation dialog warning that the current résumé file, its extracted text, and its analysis opt-in state will be replaced.
2. **Given** the replacement confirmation dialog, **When** the user confirms replacement, **Then** the system permanently removes the previous private storage object, stores the new file, resets the extracted text to pending extraction, resets the AI opt-in consent toggle to off, and initiates new text extraction.
3. **Given** the replacement confirmation dialog, **When** the user cancels, **Then** the existing résumé file, extracted text, and opt-in settings remain completely untouched.

---

### User Story 5 - Delete an Uploaded Résumé with Confirmation (Priority: P2)

As a signed-in job seeker, I want to delete an uploaded résumé from an opportunity after explicit confirmation so that I can remove sensitive personal documents if I decide not to submit or track them.

**Why this priority**: Job seekers must retain complete sovereignty over their sensitive personal documents.

**Independent Test**: Click delete on an uploaded résumé, confirm the action, and verify that the private file is deleted from storage, all extracted text and metadata are cleared, and the opportunity returns to the empty "upload résumé" state.

**Acceptance Scenarios**:

1. **Given** an opportunity with an existing uploaded résumé, **When** the user clicks delete, Then the system presents an explicit confirmation dialog warning that the action is permanent.
2. **Given** the deletion confirmation dialog, **When** the user confirms deletion, **Then** the system deletes the private storage object, removes the résumé record and extracted text from the database, resets any AI opt-in consent, and displays an empty upload area on the opportunity view.
3. **Given** the deletion confirmation dialog, **When** the user cancels, **Then** the résumé, extracted text, and settings are preserved.

---

### User Story 6 - Handle Text Extraction Failures and Provide Explicit Retry (Priority: P2)

As a signed-in job seeker, I want clear visibility into the text extraction status (pending, ready, failed) and the ability to retry if extraction fails, so that temporary processing issues or unreadable files are transparent and recoverable.

**Why this priority**: Document parsers can encounter corrupted streams, unusual fonts, or temporary processing timeouts. Clear states and explicit retries prevent silent data loss and user confusion.

**Independent Test**: Upload a valid file where extraction triggers a failure; observe that the status displays "failed" with an informative message explaining that the original file is preserved, and click "Retry Extraction" to re-attempt processing.

**Acceptance Scenarios**:

1. **Given** a résumé file that was just uploaded, **When** the user views the extraction status, **Then** the system displays a visible "pending" processing indicator until extraction completes.
2. **Given** a document that cannot be extracted (e.g., encrypted document, corrupted file structure, or scanned document without a selectable text layer), **When** extraction fails, **Then** the system marks the status as "failed", preserves the uploaded file in storage, displays a helpful explanation (including that scanned documents without text layers are not supported), and offers a "Retry Extraction" button and a manual text entry option.
3. **Given** a failed extraction state, **When** the user clicks "Retry Extraction", **Then** the system resets the state to "pending" and re-attempts server-side extraction.
4. **Given** a failed extraction state where extraction cannot succeed (e.g., scanned image), **When** the user manually enters or pastes their résumé plain text into the review editor and saves, **Then** the system transitions the state to "ready" and persists the user-provided text for analysis.

---

### User Story 7 - Enforce Privacy, Owner-Only Access, and Explicit AI Opt-In (Priority: P1)

As a signed-in job seeker, I want to trust that my résumé files and extracted text are strictly confidential, inaccessible to any other user, and never shared with an AI provider without my explicit, deliberate opt-in.

**Why this priority**: Core principles III (Privacy, Isolation, Explicit Consent) and IV (Bounded AI) mandate strict isolation, non-enumeration, and explicit consent before sensitive personal data is transmitted.

**Independent Test**: Attempt cross-user access to another user's résumé metadata, download link, or extracted text and confirm a generic unavailable response; inspect default opt-in toggle and verify it is unchecked/disabled by default.

**Acceptance Scenarios**:

1. **Given** an authenticated user attempting to view, download, update, or delete a résumé attached to an opportunity owned by another user, **When** the request is made, **Then** the system rejects the request with a generic unavailable response without revealing whether the résumé or opportunity exists.
2. **Given** an opportunity with a reviewed résumé, **When** viewing the AI analysis configuration, **Then** the system displays an explicit opt-in toggle for sending résumé text to the AI provider, which defaults to OFF (unchecked).
3. **Given** the AI opt-in toggle, **When** the user toggles consent ON or OFF, **Then** the system records this explicit choice per opportunity, and does not allow AI analysis of résumé text unless consent is explicitly active.
4. **Given** system logging during upload, extraction, and review, **When** operations execute, **Then** no raw résumé text, file payloads, or extracted contents are written to operational or error logs.

---

### Edge Cases

- **Scanned or Image-Only Documents**: A user uploads a PDF consisting purely of scanned bitmap images without an embedded text layer. Since optical character recognition (OCR) is an explicit non-goal for the MVP, automated extraction will yield empty text. The system must detect empty extracted text, transition to the "failed" state, explain that scanned documents without selectable text cannot be automatically extracted, and allow the user to manually paste their plain text or upload a text-based document.
- **Password-Protected or Encrypted Documents**: A user uploads an encrypted or password-protected PDF or DOCX. Extraction fails gracefully, the original file is preserved in storage, the state transitions to "failed", and the user is informed that encrypted documents cannot be processed.
- **Large Files at Boundary (e.g., 9.99 MB vs 10.01 MB)**: Files at or below 10,485,760 bytes (10 MB) must be accepted; files at 10,485,761 bytes or greater must be cleanly rejected with a human-readable size limit error before storage persistence.
- **Malformed MIME Type or Extension Mismatch**: A user renames an unsupported file (e.g., an executable or image) to `.pdf` or `.docx`. Server-side validation must verify the actual file headers / MIME type rather than relying solely on client-provided file extensions, cleanly rejecting disguised formats.
- **Interrupted Network or Incomplete Upload**: If the upload connection drops mid-flight, the system must not create an orphaned résumé record with an inaccessible or non-existent file reference.
- **Concurrent Opportunity Deletion**: If an opportunity is deleted while a résumé upload or extraction is in flight, background processes must terminate gracefully and any staged storage objects must be cleaned up.
- **Leading and Trailing Whitespace in Edited Résumé Text**: When a user edits extracted text, leading and trailing whitespace should be cleanly trimmed upon save, while internal formatting, line breaks, and paragraph breaks are preserved.
- **Extremely Long Extracted Text**: Unusually lengthy multi-page résumés (e.g., 10-page CVs) must be accepted, stored, and displayed in the review area without crashing the interface, silent truncation, or horizontal overflow across viewports.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an opportunity's owner to upload at most one current résumé file per opportunity.
- **FR-002**: System MUST validate that uploaded files are strictly of type PDF (`application/pdf`) or DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- **FR-003**: System MUST enforce a maximum file size limit of 10 MB (10,485,760 bytes), rejecting any file exceeding this threshold.
- **FR-004**: System MUST store uploaded résumé files in a private, authenticated storage space organized in user-scoped and opportunity-scoped paths.
- **FR-005**: System MUST prevent public access to stored résumé files and provide downloads strictly through short-lived, authenticated URLs.
- **FR-006**: System MUST perform server-side plain text extraction on every newly uploaded résumé file.
- **FR-007**: System MUST track and display the extraction lifecycle using three explicit states: `pending`, `ready`, and `failed`.
- **FR-008**: System MUST display extracted résumé text in an editable plain-text review area for the opportunity owner when extraction succeeds (`ready` state).
- **FR-009**: System MUST allow the user to edit and save the extracted plain text before any AI analysis request.
- **FR-010**: System MUST preserve the original uploaded file in storage and allow explicit retry if text extraction fails (`failed` state).
- **FR-011**: System MUST allow manual text entry or paste into the review editor if automated extraction fails.
- **FR-012**: System MUST require explicit user confirmation before replacing an existing résumé with a new file.
- **FR-013**: System MUST permanently delete the prior storage object and reset extraction and opt-in states when a résumé is replaced.
- **FR-014**: System MUST require explicit user confirmation before permanently deleting an uploaded résumé.
- **FR-015**: System MUST permanently delete the storage object and database résumé record upon confirmed deletion, returning the opportunity to the empty upload state.
- **FR-016**: System MUST provide an explicit AI opt-in consent toggle for résumé content that is OFF (unchecked) by default and per-opportunity scoped.
- **FR-017**: System MUST enforce strict owner-level authorization on all résumé operations (upload, extraction, review, download, replacement, and deletion).
- **FR-018**: System MUST return an identical generic "unavailable" response when an opportunity or résumé does not exist or is owned by another user, preventing enumeration.
- **FR-019**: System MUST render all extracted, edited, and displayed text safely as plain text to prevent script injection.
- **FR-020**: System MUST NOT log raw résumé files, extracted text, or full document contents in operational server logs.
- **FR-021**: System MUST NOT support multi-version résumé libraries, OCR for scanned images, automated résumé rewriting, or cross-opportunity résumé pooling (MVP Non-Goals).

### Key Entities *(include if feature involves data)*

- **Resume**: Represents the single uploaded résumé document attached to a specific job opportunity.
  - `id`: Unique identifier for the résumé record.
  - `opportunityId`: Reference to the parent opportunity. Each opportunity has at most one current résumé.
  - `userId`: Reference to the authenticated owner.
  - `fileName`: Original name of the uploaded document (e.g., `jane-doe-resume.pdf`).
  - `fileSize`: Size of the uploaded file in bytes.
  - `fileType`: MIME type of the uploaded document (`application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
  - `storagePath`: Private, user-isolated path where the file is stored in private object storage.
  - `extractionState`: Current lifecycle status of text extraction (`pending`, `ready`, `failed`).
  - `extractedText`: Raw plain text extracted from the document by the server-side parser.
  - `reviewedText`: User-reviewed and potentially edited plain text representation to be used in gap analysis.
  - `aiOptIn`: Boolean flag indicating whether the user has explicitly consented to send this résumé's text to the AI provider (defaults to `false`).
  - `createdAt`: Timestamp when the résumé was initially uploaded.
  - `updatedAt`: Timestamp when the résumé, text, or opt-in setting was last updated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated user can upload a valid 5 MB PDF or DOCX résumé and reach the "pending" extraction state in under 5 seconds on a standard broadband connection.
- **SC-002**: Standard digital PDF and DOCX documents complete text extraction and transition to "ready" state within 10 seconds of upload completion.
- **SC-003**: 100% of uploaded résumé files are stored in private, unguessable paths with 0 public web access.
- **SC-004**: 100% of download links expire within 5 minutes or less and require an active session for retrieval.
- **SC-005**: 100% of unauthorized attempts by one user to view, download, modify, or delete another user's résumé result in a generic "unavailable" response with 0 data leakage.
- **SC-006**: 100% of replacement and deletion operations require explicit user confirmation before permanent file destruction.
- **SC-007**: 100% of extracted and user-edited résumé text renders as plain text with 0 script execution vulnerabilities.
- **SC-008**: The AI opt-in toggle is unchecked (OFF) by default for 100% of uploaded résumés.
- **SC-009**: The upload and review interface remains fully accessible, responsive, and functional across viewports from 320px to 1440px without horizontal overflow.

## Assumptions

- **One résumé per opportunity**: In accordance with PRD Story 3 and Constitution Principle V, each opportunity maintains at most one active résumé file. Users who want to test multiple résumés for different roles create distinct opportunities.
- **Client and server format validation**: File type validation is performed both in the client (for immediate user feedback) and verified authoritatively on the server by inspecting file magic bytes/headers.
- **No OCR for MVP**: Scanned PDF files containing only raster images without a selectable text layer will fail automated extraction; users are given clear feedback and the ability to manually paste or type their résumé text or upload a digital document.
- **Ephemeral download URLs**: File downloads are served via signed, short-lived storage URLs (e.g., valid for 60 seconds) rather than proxying large binary streams through the application server or exposing public buckets.
- **Storage clean-up**: When a résumé is replaced or deleted, the underlying object in private storage is deleted immediately, avoiding orphaned storage bloat.
- **Integration with Opportunity detail**: The résumé upload and review experience will be embedded directly within or accessible from the opportunity detail view implemented in feature `005-opportunity-management`.
