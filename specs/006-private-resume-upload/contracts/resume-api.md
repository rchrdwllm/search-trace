# Interface Contract: Résumé Upload & Management API

**API Boundaries**:
1. **HTTP Binary Upload Route**: `POST /api/opportunities/[opportunityId]/resume` (multipart binary upload)
2. **tRPC v11 Router**: `resume` (mounted in `trpc/routers/_app.ts` as `appRouter.resume`)

All endpoints and procedures strictly require an active authenticated user session.

---

## 1. HTTP Binary Upload Route

### `POST /api/opportunities/[opportunityId]/resume`

Handles binary PDF and DOCX uploads for a specific opportunity.

- **Kind**: Next.js App Router Route Handler (`app/api/opportunities/[opportunityId]/resume/route.ts`)
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**:
  - `file`: Binary file stream (PDF or DOCX, max 10,485,760 bytes).
- **Authentication**: `requireSession()` validating session cookie.

#### Processing Pipeline

1. **Authentication**: Verify session; obtain `actorId`. If unauthenticated, return `401 Unauthorized`.
2. **Opportunity Ownership**: Query `opportunities` where `id = opportunityId` and `userId = actorId`. If not found, return `404 Not Found` with generic message (non-enumeration).
3. **Payload Inspection**:
   - Verify `file` field exists.
   - Enforce byte size $\le 10{,}485{,}760$ bytes. Return `400 Bad Request` if exceeded.
   - Inspect MIME and magic bytes:
     - PDF: `%PDF-` (`0x25 0x50 0x44 0x46 0x2D`)
     - DOCX: PK zip header (`0x50 0x4B 0x03 0x04`)
     - Return `400 Bad Request` if signature mismatch.
4. **Replacement Cleanup**: If a résumé record already exists for this `opportunityId`, delete the existing object from private storage.
5. **Storage Upload**: Save new file into private storage at `resumes/${actorId}/${opportunityId}/${uuid}-${sanitizedFileName}`.
6. **Database Persistence**: Upsert `resumes` table with `extractionState = 'pending'` and `aiOptIn = false`.
7. **Server-Side Extraction**: Trigger parser (`unpdf` for PDF, `mammoth` for DOCX).
   - If non-empty text extracted: set `extractedText`, `reviewedText = extractedText`, and `extractionState = 'ready'`.
   - If empty/whitespace text or error: set `extractionState = 'failed'`.
8. **Response**: Return `200 OK` with JSON payload.

#### Response Schemas

**Success (200 OK)**:
```json
{
  "resume": {
    "id": "uuid-string",
    "opportunityId": "uuid-string",
    "fileName": "Jane_Doe_Resume.pdf",
    "fileSize": 245100,
    "fileType": "application/pdf",
    "extractionState": "ready",
    "createdAt": "2026-09-08T12:00:00.000Z",
    "updatedAt": "2026-09-08T12:00:00.000Z"
  }
}
```

**Errors**:
- `400 Bad Request`: `{"error": "Only PDF and DOCX files up to 10 MB are supported."}`
- `401 Unauthorized`: `{"error": "Please sign in to continue."}`
- `404 Not Found`: `{"error": "The requested resource is unavailable."}`
- `500 Internal Server Error`: `{"error": "Unable to complete that request. Please try again."}`

---

## 2. tRPC Domain Router (`resume`)

**Module**: `trpc/routers/resume.ts`  
**Root Path**: `appRouter.resume`

### Shared Schemas (`lib/validations/resume.ts`)

```typescript
import { z } from "zod";

export const extractionStateEnum = z.enum(["pending", "ready", "failed"]);
export type ExtractionState = z.infer<typeof extractionStateEnum>;

export const resumeOpportunityInputSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
});

export const updateReviewedTextInputSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  reviewedText: z.string().trim().min(1, "Reviewed text cannot be empty"),
});

export const setAiOptInInputSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  enabled: z.boolean(),
});
```

---

### Procedure 1: `resume.getByOpportunityId`

Retrieves current résumé metadata and reviewed text for an opportunity.

- **Kind**: Query (`protectedProcedure`)
- **Input**: `resumeOpportunityInputSchema`
- **Output**:
  ```typescript
  {
    id: string;
    opportunityId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    extractionState: "pending" | "ready" | "failed";
    extractedText: string | null;
    reviewedText: string | null;
    aiOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null
  ```
- **Ownership**: Checks that parent opportunity is owned by `ctx.actorId`. If foreign or missing, throws `unavailableResource()`.

---

### Procedure 2: `resume.updateReviewedText`

Updates and saves the user-edited plain text for downstream gap analysis.

- **Kind**: Mutation (`protectedProcedure`)
- **Input**: `updateReviewedTextInputSchema`
- **Output**:
  ```typescript
  {
    success: true;
    reviewedText: string;
    extractionState: "ready";
    updatedAt: Date;
  }
  ```
- **Behavior**: Verifies ownership; updates `reviewedText` and ensures `extractionState = 'ready'`. Throws `unavailableResource()` if foreign/missing.

---

### Procedure 3: `resume.setAiOptIn`

Updates the explicit AI provider opt-in consent toggle for this opportunity's résumé.

- **Kind**: Mutation (`protectedProcedure`)
- **Input**: `setAiOptInInputSchema`
- **Output**:
  ```typescript
  {
    success: true;
    aiOptIn: boolean;
    updatedAt: Date;
  }
  ```
- **Behavior**: Verifies ownership; updates `aiOptIn`. Throws `unavailableResource()` if foreign/missing.

---

### Procedure 4: `resume.getDownloadUrl`

Generates an authenticated, short-lived signed URL to download the original document.

- **Kind**: Mutation (`protectedProcedure`)
- **Input**: `resumeOpportunityInputSchema`
- **Output**:
  ```typescript
  {
    downloadUrl: string;
    expiresInSeconds: number; // 60
  }
  ```
- **Behavior**: Verifies ownership; fetches storage path; calls `storageService.createSignedUrl(path, 60)`. Throws `unavailableResource()` if foreign/missing.

---

### Procedure 5: `resume.retryExtraction`

Re-triggers server-side text extraction on an existing stored file when extraction previously failed.

- **Kind**: Mutation (`protectedProcedure`)
- **Input**: `resumeOpportunityInputSchema`
- **Output**:
  ```typescript
  {
    success: true;
    extractionState: "ready" | "failed";
    extractedText: string | null;
    reviewedText: string | null;
  }
  ```
- **Behavior**: Verifies ownership; downloads file from private storage; runs parser (`unpdf`/`mammoth`); updates `resumes` record. Throws `unavailableResource()` if foreign/missing.

---

### Procedure 6: `resume.delete`

Permanently deletes the uploaded résumé file and its database record after user confirmation.

- **Kind**: Mutation (`protectedProcedure`)
- **Input**: `resumeOpportunityInputSchema`
- **Output**:
  ```typescript
  {
    success: true;
  }
  ```
- **Behavior**: Verifies ownership; deletes private storage object; deletes `resumes` row in Drizzle; returns opportunity to empty upload state. Throws `unavailableResource()` if foreign/missing.
