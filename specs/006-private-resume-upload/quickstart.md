# Quickstart & Verification Guide: Private Résumé Upload and Review

This document provides runnable verification instructions, test scenarios, and manual validation steps for Story 3 (Private Résumé Upload and Review).

---

## 1. Prerequisites

- Bun `1.4.2` installed.
- Local repository initialized with locked dependencies:
  ```powershell
  bun install --frozen-lockfile
  ```
- Environment variables configured (or default offline mocks active):
  ```powershell
  cp .env.example .env.local
  ```

---

## 2. Automated Quality Gates

Run the offline, zero-credential verification test suite:

```powershell
# Run full repository quality gate (lint, strict typecheck, Jest suite)
bun run check

# Run private résumé upload test suites specifically
bun run test -- tests/006-private-resume-upload

# Run individual verification suites
bun run test -- tests/006-private-resume-upload/routes/upload-route.test.ts
bun run test -- tests/006-private-resume-upload/procedures/resume-router.test.ts
bun run test -- tests/006-private-resume-upload/extraction/text-extraction.test.ts
bun run test -- tests/006-private-resume-upload/storage/resume-storage.test.ts
bun run test -- tests/006-private-resume-upload/components/resume-section.test.ts
bun run test -- tests/006-private-resume-upload/boundaries/resume-boundary.test.ts
```

---

## 3. Database Migration Workflow

When schema definitions in `lib/db/schema.ts` are ready:

```powershell
# Generate versioned Drizzle migration
bun run db:generate -- --name add_resumes_table

# Apply migration to target Postgres instance (if running local Supabase)
bun run db:migrate
```

---

## 4. Manual Verification Walkthrough

Start the local development server:

```powershell
bun run dev
```

Navigate to `http://localhost:3000` in a browser.

### Scenario A: Upload a PDF Résumé & Automatic Extraction
1. Sign in with test credentials (`test@example.com` / `ValidPass123!`).
2. Open an existing opportunity from `/dashboard`.
3. Locate the "Résumé" section. Verify the empty dropzone displays:
   - "Upload résumé (PDF or DOCX, up to 10 MB)".
4. Drag or select a sample PDF résumé (under 10 MB).
5. Verify upload progress indicator: "Uploading and extracting text...".
6. Verify successful upload transitions to `ready`:
   - File card displays document name, size, and green "Extraction ready" badge.
   - Plain text extracted from the PDF renders in the reviewed text preview area.

### Scenario B: Review & Edit Extracted Plain Text
1. Click the "Edit Text" action above the extracted résumé text.
2. Verify the plain text opens in an editable textarea with character/word counters.
3. Edit the text (e.g., correct a typo or add a bullet point).
4. Click "Save Changes".
5. Verify an accessible status message announces "Changes saved", and the updated text is persisted.

### Scenario C: Download Document via Short-Lived Link
1. Click the "Download" button on the file card.
2. Verify that a new tab opens and the original document is served.
3. Inspect the download URL: confirm it is a signed, temporary URL.

### Scenario D: Extraction Failure & Retry
1. Upload a password-protected or image-only scanned PDF (no text layer).
2. Verify the status updates to red `Extraction failed`.
3. Verify an informational alert appears explaining that scanned PDFs without selectable text are not supported.
4. Verify the "Retry Extraction" button is available, and an option to manually paste text is provided.
5. Click "Enter Text Manually", paste plain text, and click "Save". Verify the status transitions to `ready`.

### Scenario E: Replace Résumé with Confirmation
1. On an opportunity with an existing résumé, click "Replace".
2. Select a new DOCX file.
3. Verify an accessible confirmation modal opens:
   - Warning: "Replacing your résumé will permanently delete the current file and reset your reviewed text and AI consent settings."
4. Click "Cancel". Verify the previous résumé remains unchanged.
5. Click "Replace" again and confirm.
6. Verify previous storage file is deleted, new file is uploaded, text extraction runs, and the AI opt-in toggle resets to OFF.

### Scenario F: Delete Résumé with Confirmation
1. Click "Delete" on the résumé card.
2. Verify the confirmation modal opens: "Are you sure you want to permanently delete this résumé?".
3. Confirm deletion.
4. Verify the file and database record are removed, and the section returns to the empty upload dropzone.

### Scenario G: AI Consent Toggle Verification
1. On an opportunity with an uploaded résumé, inspect the AI consent toggle.
2. Verify that it is **OFF** (unchecked) by default.
3. Toggle it ON. Verify change is saved.
4. Refresh the page; verify the toggle remains ON.

### Scenario H: Cross-User Ownership Isolation & Non-Enumeration
1. Sign in as User A; note Opportunity ID with an uploaded résumé.
2. Sign out and sign in as User B.
3. Attempt to fetch or mutate User A's résumé via tRPC (`resume.getByOpportunityId`) or route handler (`POST /api/opportunities/[UserA_Id]/resume`).
4. Verify that the response is strictly `404 Not Found` (`unavailableResource()`) with 0 data leakage.
