# Research: Private Résumé Upload and Review

## Decisions

### 1. Document Text Extraction Libraries (PDF & DOCX)

**Decision**: Use `unpdf` for PDF text extraction and `mammoth` for DOCX text extraction.

**Rationale**:
- Both libraries are written purely in JavaScript/TypeScript with zero native C++ binary dependencies (unlike Poppler or antiword), allowing reliable cross-platform execution on Windows, Linux, and Node/Bun serverless runtimes.
- `unpdf` is an edge- and serverless-friendly wrapper around Mozilla's PDF.js that extracts clean plain text from PDF buffers.
- `mammoth` is the industry standard for extracting clean plain text from Word (.docx) documents without extraneous styling or XML tags.
- Both libraries fail gracefully on encrypted, corrupted, or password-protected documents, returning catchable errors that map cleanly to `extractionState: "failed"`.
- **Scanned PDFs & OCR Non-Goal**: If extracted text is empty or contains only whitespace (common with scanned image PDFs), the system marks the state as `failed` with a user-facing explanation that OCR is not supported in the MVP and provides a manual text entry/paste fallback.

**Alternatives considered**:
- *`pdf-parse`*: Popular legacy library, but contains unmaintained internal test-file loading patterns that trigger issues in Next.js bundlers.
- *`tesseract.js` / OCR*: Excluded as an explicit PRD non-goal; heavy, slow, and non-deterministic for an evidence-grounded application.

---

### 2. Private Storage Architecture & Offline Test Resilience

**Decision**: Define a server-only storage interface (`ResumeStorageService`) in `lib/storage/resume.ts`:
- **Production / Deployed Mode**: Operates against a private Supabase Storage bucket named `resumes`, storing files under user- and opportunity-scoped paths: `resumes/${userId}/${opportunityId}/${fileId}-${sanitizedFileName}`. Download URLs are generated using short-lived signed URLs with a 60-second time-to-live (TTL).
- **Offline / Test Mode**: Provide an in-memory/local storage provider (`InMemoryResumeStorageService`) that enables zero-credential, offline execution of the test suite (`bun run check`), strictly adhering to repository quality gate invariants.

**Rationale**: Fulfills PRD Story 3 ("saved in a private bucket; downloaded only through short-lived, authenticated links"), Constitution Principle III (user-scoped private storage), and AGENTS.md requirement for offline-first test resilience.

**Alternatives considered**:
- *Direct public bucket*: Prohibited by Constitution Principle III and PRD Story 3.
- *Streaming binary downloads through Next.js proxy*: Unnecessarily ties up server compute and memory for 10 MB binaries; signed storage URLs offload delivery securely while enforcing short expirations.

---

### 3. Upload Transport & API Architecture

**Decision**:
- **Binary File Upload & Replacement**: Implement a dedicated Next.js Route Handler at `POST /api/opportunities/[opportunityId]/resume`. It accepts `multipart/form-data`, authenticates the session via `requireSession()`, validates opportunity ownership, inspects file size (≤ 10 MB) and file magic bytes, saves to private storage, records the `resumes` record in Drizzle with `extractionState: "pending"`, triggers server-side text extraction, and returns the résumé metadata.
- **Metadata, Review, & Lifecycle Procedures**: Expose a typed tRPC domain router `trpc/routers/resume.ts` mounted under `resume` in `trpc/routers/_app.ts`:
  - `resume.getByOpportunityId`: Protected query returning current résumé metadata, extraction state, reviewed text, and AI opt-in status.
  - `resume.updateReviewedText`: Protected mutation allowing user to edit and save reviewed plain text.
  - `resume.setAiOptIn`: Protected mutation to toggle AI analysis opt-in (default `false`).
  - `resume.getDownloadUrl`: Protected mutation/query generating a 60-second signed download URL.
  - `resume.retryExtraction`: Protected mutation to re-trigger server-side text extraction on an existing stored file.
  - `resume.delete`: Protected mutation to delete the private storage file and database record with cascade.
- **Non-enumeration**: Any query or mutation for an opportunity or résumé not owned by `ctx.actorId` throws `unavailableResource()` (HTTP 404 NOT_FOUND).

**Rationale**: tRPC with SuperJSON is designed for structured JSON; encoding 10 MB files as base64 adds ~33% overhead (13.3 MB payloads) and causes severe memory spikes during JSON serialization. Using a standard Next.js Route Handler for binary upload while keeping all CRUD and lifecycle actions in tRPC v11 maintains optimal performance, security, and type safety.

**Alternatives considered**:
- *Base64 encoding inside tRPC mutation*: Memory-inefficient, risks Vercel serverless request body limits.
- *Direct browser upload to Supabase*: Requires distributing storage policies and credentials to the browser, bypassing server-side magic byte inspection and ownership enforcement.

---

### 4. File Validation & Magic Byte Inspection (Security Boundary)

**Decision**: Enforce a three-tier validation check on the server before storage or extraction:
1. **Size check**: Exact byte length must be $\le 10{,}485{,}760$ bytes (10 MB).
2. **Declared MIME & Extension**: Must match `.pdf` (`application/pdf`) or `.docx` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
3. **Magic Byte Signature**:
   - PDF: First 5 bytes must match `%PDF-` (`0x25 0x50 0x44 0x46 0x2D`).
   - DOCX: First 4 bytes must match the ZIP local file header `0x50 0x4B 0x03 0x04`.

**Rationale**: Protects against file spoofing, disguised binaries (e.g., executables or HTML renamed to `.pdf`), and malicious payloads, satisfying Constitution Principle III and FR-002, FR-003.

**Alternatives considered**:
- *Trusting `file.type` from browser*: Insecure; client headers are easily forged.

---

### 5. Single-Résumé Invariant & Replacement/Deletion Confirmation

**Decision**:
- Enforce the single-résumé constraint at the database level with `unique()` on `resumes.opportunityId`.
- Replacing a résumé requires explicit UI confirmation in an accessible `AlertDialog`. When confirmed, the server purges the prior storage object, stores the new file, resets extraction state to `pending`, resets `reviewedText`, and resets `aiOptIn: false`.
- Deletion requires explicit user confirmation, permanently removing the storage object and database row, returning the opportunity UI to the empty upload dropzone.

**Rationale**: Fulfills PRD Story 3 acceptance criteria ("Replacing or deleting a résumé removes its prior private object after confirmation. Multi-version résumé libraries... are deferred").

**Alternatives considered**:
- *Multi-version history / soft deletes*: Explicitly rejected by PRD non-goals.

---

### 6. Plain-Text Display and Human Review Ergonomics

**Decision**: Extracted and user-edited text is rendered in an accessible plain-text area with CSS `whitespace-pre-wrap`, accompanied by character/word count indicators, clear "Save Changes" and "Cancel" buttons, and an explicit AI opt-in toggle that defaults to unchecked (`false`).

**Rationale**: Fulfills Constitution Principle II (Human Review and Control) and Principle I (Evidence Before Inference). Zero HTML/Markdown parsing prevents script injection and ensures clean verbatim excerpts for downstream citations.

---

## Sources

- `AGENTS.md`: Sections 6.1 (tRPC API Layer), 6.2 (Database & Drizzle ORM), 6.4 (Boundary Isolation), 7 (UI & Accessibility Standards)
- `.specify/memory/constitution.md`: Principles I (Evidence Before Inference), II (Human Review and Control), III (Privacy, Isolation, Explicit Consent), and V (Lean Delivery)
- `docs/prd/prd.md`: Section 2, Story 3 ("Upload and review the résumé used for an opportunity")
- `specs/006-private-resume-upload/spec.md`: User Stories 1–7 and Functional Requirements FR-001–FR-021
