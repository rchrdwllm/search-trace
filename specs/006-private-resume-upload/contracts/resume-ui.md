# Interface Contract: Résumé Upload & Review UI

## 1. Component Hierarchy & Placements

The résumé upload and review experience is embedded directly within the Opportunity detail view:

```text
app/dashboard/opportunities/[opportunityId]/page.tsx
└── ResumeSection (components/resumes/resume-section.tsx)
    ├── [If no résumé uploaded]
    │   └── ResumeUploadDropzone (components/resumes/resume-upload-dropzone.tsx)
    │
    └── [If résumé exists]
        ├── ResumeCard (components/resumes/resume-card.tsx)
        │   ├── File Metadata (filename, size, upload date)
        │   ├── ExtractionStatusBadge (pending | ready | failed)
        │   └── Actions (Download, Replace, Delete)
        │
        ├── [If extractionState == "failed"]
        │   └── ResumeExtractionAlert (components/resumes/resume-extraction-alert.tsx)
        │       ├── Informative failure explanation & scanned-doc guidance
        │       ├── Retry Extraction Button
        │       └── Manual Text Entry Toggle
        │
        ├── [If extractionState == "ready" or manual mode active]
        │   └── ResumeReviewEditor (components/resumes/resume-review-editor.tsx)
        │       ├── Plain-text review textarea
        │       ├── Word / character count display
        │       └── Save Changes & Revert Buttons
        │
        ├── ResumeAiConsentToggle (components/resumes/resume-ai-consent-toggle.tsx)
        │   └── Default-OFF toggle for sending reviewed text to AI provider
        │
        ├── ResumeReplaceDialog (components/resumes/resume-replace-dialog.tsx)
        │   └── Accessible confirmation modal before overwriting existing résumé
        │
        └── ResumeDeleteDialog (components/resumes/resume-delete-dialog.tsx)
            └── Accessible confirmation modal before permanent file destruction
```

---

## 2. Component Specifications

### 2.1 `ResumeUploadDropzone`

Presents the file selection area when an opportunity has no current résumé.

- **Props**:
  - `opportunityId: string`
  - `onUploadSuccess: (resume: ResumeSummary) => void`
  - `isReplacing?: boolean`
- **Supported Formats**: `.pdf`, `.docx`
- **Max File Size**: 10 MB (10,485,760 bytes)
- **Visual States**:
  - Idle: Accessible drag-and-drop box with "Upload résumé (PDF or DOCX, up to 10 MB)"
  - Dragging: Highlighted dashed border
  - Uploading: Progress spinner and "Uploading and extracting text..."
  - Error: Inline error message with `role="alert"` (e.g., "Files must be PDF or DOCX under 10 MB")
- **Accessibility**:
  - Hidden native `<input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" id="resume-file-input" />`
  - Associated `<label htmlFor="resume-file-input">`
  - Keyboard triggerable (Enter / Space opens file picker)

---

### 2.2 `ResumeCard`

Displays the current document's metadata, status, and management actions.

- **Props**:
  - `resume: ResumeSummary`
  - `onDownload: () => void`
  - `onReplace: () => void`
  - `onDelete: () => void`
- **Elements**:
  - Document icon (FileText)
  - Filename (plain text, truncated gracefully if over 40 characters)
  - Formatted file size (e.g., `245 KB`)
  - Upload date relative or formatted (e.g., `Uploaded on Sep 8, 2026`)
  - Status badge:
    - `pending`: Amber badge with animate-spin icon: "Extracting text..."
    - `ready`: Emerald badge with CheckCircle icon: "Extraction ready"
    - `failed`: Destructive badge with AlertCircle icon: "Extraction failed"
  - Action buttons:
    - "Download": Accessible button requesting signed URL and opening in safe tab
    - "Replace": Outlined button opening `ResumeReplaceDialog`
    - "Delete": Destructive-outline button opening `ResumeDeleteDialog`

---

### 2.3 `ResumeReviewEditor`

Provides full human review and text editing before AI analysis.

- **Props**:
  - `opportunityId: string`
  - `initialText: string`
  - `extractionState: ExtractionState`
  - `onSave: (text: string) => Promise<void>`
- **Visual States**:
  - Read/Preview Mode: Collapsible or inline plain-text display rendered inside `<div className="whitespace-pre-wrap font-sans text-sm text-foreground">`
  - Edit Mode: Active `<textarea id="resume-text-editor" aria-label="Reviewed résumé plain text" />` with autofocus
  - Status/Counters: Word count and character count indicators
  - Controls: "Save Changes" (primary), "Cancel" (ghost/revert)
- **Accessibility**:
  - Form controls have explicit labels or `aria-label`
  - Success message announces to screen readers with polite live region: `<div role="status">Changes saved</div>`

---

### 2.4 `ResumeAiConsentToggle`

Enforces Constitution Principle III: explicit consent for AI provider usage.

- **Props**:
  - `opportunityId: string`
  - `enabled: boolean`
  - `onToggle: (enabled: boolean) => Promise<void>`
- **Elements**:
  - Toggle switch / checkbox with label: "Include résumé in AI analysis"
  - Descriptive caption: "Allow your reviewed résumé text to be sent to the configured AI provider during evidence analysis. OFF by default."
  - Checked state: strictly reflects `resume.aiOptIn` (default `false`)

---

### 2.5 `ResumeReplaceDialog` & `ResumeDeleteDialog`

Accessible modal dialogs adhering to Shadcn / Radix `AlertDialog` standards.

- **Behavior**:
  - Traps keyboard focus upon open
  - Dismisses on Escape key or Cancel button
  - Confirm button initiates the respective mutation (replacing or deleting)
  - Replaces or removes storage object permanently
- **Accessibility**:
  - Uses `role="alertdialog"`
  - Contains `AlertDialogTitle` and `AlertDialogDescription`
  - Accessible name and description programmatically associated
