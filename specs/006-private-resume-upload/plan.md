# Implementation Plan: Private Résumé Upload and Review

**Branch**: `006-private-resume-upload` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-private-resume-upload/spec.md` (Story 3 — "Upload and review the résumé used for an opportunity" from `docs/prd/prd.md`).

---

## Summary

Implement private résumé upload, server-side plain text extraction, human review/editing, secure ephemeral downloading, and explicit AI consent for job opportunities. The feature introduces:
1. A typed `resumes` table in Drizzle ORM scoped to the authenticated user and parent opportunity (with a unique constraint enforcing the single-résumé invariant).
2. A dedicated Next.js App Router route handler (`POST /api/opportunities/[opportunityId]/resume`) for multipart binary file uploads with three-tier validation (size ceiling of 10 MB, MIME verification, and magic byte inspection).
3. Server-side plain text extraction using `unpdf` for PDF and `mammoth` for DOCX, with explicit lifecycle tracking (`pending`, `ready`, `failed`) and OCR non-goal fallback guidance.
4. A server-only private storage service (`ResumeStorageService`) targeting Supabase Storage with user-scoped paths and 60-second signed download links, with an in-memory test provider ensuring offline test resilience (`bun run check`).
5. A typed tRPC v11 `resumeRouter` with 6 protected procedures for review editing, AI opt-in toggling, signed URL retrieval, extraction retry, and confirmed replacement/deletion.
6. Accessible UI components integrated into the opportunity detail view with full plain text rendering, live region status updates, and accessible confirmation dialogs.

---

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2.8, Next.js 16.3.4 (App Router), Bun 1.4.2

**Primary Dependencies**: `unpdf` (PDF text extraction), `mammoth` (DOCX text extraction), tRPC v11, SuperJSON, TanStack React Query v5, Zod 4.1.12, Better Auth 1.7.3, Drizzle ORM 0.45.2, Lucide React, Radix UI primitives, Tailwind CSS v4

**Storage**: Supabase Storage private bucket `resumes` with user- and opportunity-scoped paths: `resumes/${userId}/${opportunityId}/${uuid}-${sanitizedFileName}`. Application metadata and text representations are stored in the `resumes` Postgres table in the `public` schema via server-only Drizzle connections, with cascading foreign keys to `opportunities.id` and `user.id`.

**Testing**: Jest 30 with `--experimental-vm-modules`, React Testing Library, `jest-axe`, PGlite in-memory database test harness, in-memory storage mock provider, and static boundary assertions.

**Target Platform**: Node.js 20+ serverless hosting (Vercel) and modern evergreen browsers across responsive widths (320px to 1440px).

**Project Type**: Full-stack Next.js App Router application.

**Performance Goals**:
- Binary uploads and storage dispatch complete in under 2 seconds on broadband connections.
- Text extraction transitions to `ready` within 5 seconds for standard résumés.
- Signed download URLs generated in under 150ms.
- Reviewed text editing interactions render without UI latency or horizontal overflow.

**Constraints**:
- **Single-résumé scope**: Exactly one current résumé per opportunity; no multi-version libraries or cross-opportunity résumé pooling.
- **File limits**: PDF and DOCX only; strictly $\le 10{,}485{,}760$ bytes (10 MB).
- **Security & Validation**: Authoritative server-side magic byte inspection; client headers never trusted alone.
- **Privacy & Storage**: Private storage paths with zero public access; downloads require authenticated, signed URLs expiring in 60 seconds.
- **AI Consent**: Explicit per-opportunity toggle, default **OFF** (`false`).
- **Human Control & Plain Text**: Extracted text must be editable before analysis; rendered as plain text (`whitespace-pre-wrap`) with zero script execution risk.
- **Logging**: Operational logs never record raw résumé buffers, extracted text, or document contents.
- **Non-enumeration**: Non-owner or nonexistent queries return `unavailableResource()` (HTTP 404 NOT_FOUND).

**Scale/Scope**: 1 Next.js Route Handler, 6 tRPC procedures, 1 Drizzle table, 6 UI components, and a dedicated test suite in `tests/006-private-resume-upload/`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Constitutional Concern | Plan Response | Status |
|---|---|:---:|
| **I. Evidence Before Inference** | Verbatim plain text extracted from uploaded document and displayed for user review. No AI modification of source text. | Pass |
| **II. Human Review and Control** | User reviews and can edit extracted text before any AI analysis. Failed extractions allow manual text entry. Replacement and deletion require explicit confirmation. | Pass |
| **III. Privacy, Isolation, and Explicit Consent** | User-scoped private storage paths (`resumes/${userId}/...`). Authenticated short-lived signed URLs (60s). AI opt-in toggle is default-off (`false`). Cross-user access denied via non-enumeration `unavailableResource()`. Logs never contain document text. | Pass |
| **IV. Bounded and Honest AI** | Extraction failures are explicit (`failed`) with clear guidance that OCR is excluded from MVP. AI analysis is completely blocked until explicit opt-in is granted. | Pass |
| **V. Lean, Testable Delivery** | Strictly bounded to Story 3; excludes non-goals (no multi-version libraries, OCR, rewriting, or auto-apply). Automated tests partitioned into `tests/006-private-resume-upload/`. Offline quality gate supported via in-memory storage. | Pass |

**Post-design review: PASS.**  
Design artifacts (`data-model.md`, `contracts/resume-api.md`, `contracts/resume-ui.md`, `quickstart.md`) strictly adhere to all constitutional principles, security boundaries, and accessibility standards.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-private-resume-upload/
├── spec.md                                  # Feature specification
├── plan.md                                  # Implementation plan (this file)
├── research.md                              # Phase 0 decisions and library evaluations
├── data-model.md                            # Entity specifications and state transitions
├── quickstart.md                            # Runnable verification walkthrough
├── contracts/
│   ├── resume-api.md                        # HTTP upload route & tRPC router contracts
│   └── resume-ui.md                         # Component hierarchy & accessibility contracts
├── checklists/
│   └── requirements.md                      # Spec quality checklist
└── tasks.md                                 # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
lib/
├── db/
│   └── schema.ts                            # [MODIFY] Add resumes table and relations
├── validations/
│   └── resume.ts                            # [NEW] Shared Zod schemas & format validators
├── extraction/
│   ├── parser.ts                            # [NEW] Server-side PDF/DOCX text extraction (unpdf + mammoth)
│   └── magic-bytes.ts                       # [NEW] File signature inspection (PDF/DOCX magic bytes)
└── storage/
    ├── resume.ts                            # [NEW] ResumeStorageService interface & implementations
    ├── supabase-storage.ts                  # [NEW] Supabase Storage private bucket provider
    └── in-memory-storage.ts                 # [NEW] In-memory storage provider for offline test gate

app/
├── api/
│   └── opportunities/
│       └── [opportunityId]/
│           └── resume/
│               └── route.ts                 # [NEW] Multipart binary upload Route Handler
└── dashboard/
    └── opportunities/
        └── [opportunityId]/
            └── page.tsx                     # [MODIFY] Embed ResumeSection in opportunity detail view

trpc/routers/
├── _app.ts                                  # [MODIFY] Register resumeRouter
└── resume.ts                                # [NEW] Domain router (get, updateText, optIn, download, retry, delete)

components/
└── resumes/
    ├── resume-section.tsx                   # [NEW] Primary coordinator component
    ├── resume-upload-dropzone.tsx           # [NEW] Accessible upload drag-and-drop area
    ├── resume-card.tsx                      # [NEW] Document metadata, status badge, & action bar
    ├── resume-review-editor.tsx             # [NEW] Editable plain-text viewer with word counters
    ├── resume-ai-consent-toggle.tsx         # [NEW] Default-off explicit AI consent switch
    ├── resume-extraction-alert.tsx          # [NEW] Error banner with retry & manual text entry actions
    ├── resume-replace-dialog.tsx            # [NEW] Accessible replacement confirmation modal
    └── resume-delete-dialog.tsx             # [NEW] Accessible deletion confirmation modal

drizzle/
├── 0002_add_resumes.sql                     # [NEW] Generated migration SQL
└── meta/                                    # [MODIFY] Updated Drizzle migration snapshots

tests/006-private-resume-upload/
├── boundaries/
│   └── resume-boundary.test.ts              # [NEW] Static boundaries & server-only import assertions
├── extraction/
│   └── text-extraction.test.ts              # [NEW] PDF & DOCX parser, magic bytes, & corruption tests
├── storage/
│   └── resume-storage.test.ts               # [NEW] Storage paths, signed URL expiration, & cleanup tests
├── routes/
│   └── upload-route.test.ts                 # [NEW] HTTP multipart upload route & security checks
├── procedures/
│   └── resume-router.test.ts                # [NEW] tRPC procedure contracts & ownership checks
└── components/
    └── resume-section.test.tsx              # [NEW] Component interactions, accessibility, & axe tests
```

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations. Design strictly adheres to all core principles.*
