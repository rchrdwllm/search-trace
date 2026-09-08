# Interface Contract: Opportunity UI Components & Pages

## Page Routes & Layouts

All opportunity routes are nested under `/dashboard` and wrapped by `app/dashboard/layout.tsx`, inheriting `AppShell` and its single `<main id="main-content">` landmark.

```text
app/dashboard/
├── page.tsx                                  # Dashboard landing: lists opportunities or empty state
└── opportunities/
    ├── new/
    │   └── page.tsx                          # Create opportunity form
    └── [opportunityId]/
        ├── page.tsx                          # Opportunity detail view
        └── edit/
            └── page.tsx                      # Edit opportunity form
```

---

## 1. Dashboard View (`app/dashboard/page.tsx`)

### Visual & Semantic Structure
- **Heading**: Accessible `<h1>` with user greeting and opportunity workspace status.
- **Header Actions**: "New Opportunity" primary button linking to `/dashboard/opportunities/new`.
- **States**:
  1. **Populated State**:
     - Grid or list of opportunity cards.
     - Each card displays:
       - Company name (`<h3>`)
       - Role title
       - Status badge (`draft`, `applied`, `interviewing`, `rejected`, `closed`) with distinct accessible color tokens
       - Last updated date (formatted politely)
       - Direct clickable link to `/dashboard/opportunities/[opportunityId]`
  2. **Empty State**:
     - Rendered when the user has 0 opportunities.
     - Informative card explaining that SearchTrace analyzes one opportunity at a time.
     - Prominent Call to Action button: "Create Your First Opportunity" (`/dashboard/opportunities/new`).

---

## 2. New Opportunity Page (`app/dashboard/opportunities/new/page.tsx`)

### Visual & Semantic Structure
- **Breadcrumb**: `Dashboard > New Opportunity`
- **Heading**: `<h1>` "Create Opportunity"
- **Form Fields**:
  - `Company`: `<Input id="company" name="company" required maxLength={100} />`
  - `Role Title`: `<Input id="role" name="role" required maxLength={100} />`
  - `Status`: `<select id="status">` or accessible dropdown menu defaulting to `draft`.
  - `Source URL`: `<Input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://..." />`
  - `Job Description`: `<Textarea id="jobDescription" name="jobDescription" rows={12} required placeholder="Paste the complete job description text here..." />`
- **Form Actions**:
  - Cancel button: Navigates back to `/dashboard` without saving.
  - Submit button: "Create Opportunity" (displays loading spinner when submitting).
- **Outcome**: On success, redirects to `/dashboard/opportunities/[opportunityId]`.

---

## 3. Opportunity Detail View (`app/dashboard/opportunities/[opportunityId]/page.tsx`)

### Visual & Semantic Structure
- **Breadcrumb**: `Dashboard > [Company] - [Role]`
- **Header Bar**:
  - Company name & Role title (`<h1>`)
  - Status badge
  - Action buttons:
    - "Edit" link button (`/dashboard/opportunities/[opportunityId]/edit`)
    - "Delete" button (triggers accessible confirmation dialog)
- **Metadata Card**:
  - Source URL: If present, renders an external link (`<a href="..." target="_blank" rel="noopener noreferrer">View Original Posting <ExternalLinkIcon aria-hidden="true" /> <span className="sr-only">(opens in new tab)</span></a>`).
  - Analysis Status indicator: "Analysis not yet run" (preparatory for Story 5).
  - Created & Last Updated dates.
- **Job Description Section**:
  - `<h2>` "Job Description"
  - Container rendering the job description text with CSS `whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground`.
  - Explicitly rendered as plain text (no HTML parsing, markdown rendering, or dangerous markup).

---

## 4. Edit Opportunity Page (`app/dashboard/opportunities/[opportunityId]/edit/page.tsx`)

### Visual & Semantic Structure
- **Breadcrumb**: `Dashboard > [Company] - [Role] > Edit`
- **Heading**: `<h1>` "Edit Opportunity"
- **Form**: Pre-populated with current opportunity values.
- **Form Actions**:
  - Cancel button: Returns to `/dashboard/opportunities/[opportunityId]` without modifications.
  - Save button: "Save Changes" (displays loading spinner during submission).
- **Outcome**: On success, redirects back to `/dashboard/opportunities/[opportunityId]` and displays an affirmative polite alert.

---

## 5. Delete Confirmation Dialog (`components/opportunities/opportunity-delete-dialog.tsx`)

### Accessibility & Behavior Contract
- **Trigger**: "Delete Opportunity" destructive button.
- **Component**: Accessible modal dialog (`AlertDialog` or accessible Radix primitive).
- **Role**: `role="alertdialog"` with `aria-labelledby` and `aria-describedby`.
- **Title**: "Delete this opportunity?"
- **Description**: "This will permanently remove the opportunity for **[Role]** at **[Company]**. This action cannot be undone."
- **Actions**:
  - "Cancel" button: Closes dialog and returns focus to the trigger button.
  - "Delete permanently" button: Destructive variant button. Calls `opportunity.delete({ id })`.
- **Completion**: On successful deletion, closes dialog, navigates to `/dashboard`, and announces affirmative status via polite live region.

---

## 6. Accessibility & Invariant Rules

1. **Single `<main>`**: Opportunity views must never introduce a second `<main>` tag; all content mounts inside `AppShell`'s `SidebarInset` (`<main id="main-content">`).
2. **Form Accessibility**:
   - Every input has an explicitly associated `<Label htmlFor="...">`.
   - Error messages are associated via `aria-describedby="[field]-error"`.
   - Fields in an invalid state have `aria-invalid="true"`.
3. **Automated Axe Testing**: All opportunity pages and components must pass `jest-axe` checks with 0 violations.
