# UI Contract: Supporting Evidence Components & Views

**Feature**: Supporting Evidence Library and Opportunity Selection  
**Branch**: `008-supporting-evidence`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Route Layout & Component Hierarchy

Supporting Evidence provides both a standalone library management route and an embedded opportunity selection section.

```text
app/dashboard/
├── evidence/
│   └── page.tsx                               # Standalone Personal Evidence Library view
└── opportunities/
    └── [opportunityId]/
        └── page.tsx                           # Embeds OpportunityEvidenceSection
```

### Component Breakdown

```text
components/evidence/
├── evidence-card.tsx                          # Individual evidence card (library or opportunity view)
├── evidence-form-dialog.tsx                   # Modal dialog for creating/editing an evidence item
├── evidence-delete-dialog.tsx                 # Confirmation dialog with opportunity cascade warning
├── evidence-type-badge.tsx                    # Category pill badge (project, accomplishment, link)
├── evidence-empty-state.tsx                   # Empty state prompt with create CTA
├── opportunity-evidence-section.tsx           # Embedded section within opportunity detail view
└── evidence-picker-dialog.tsx                 # Modal to select & attach available library items
```

---

## 2. Views & Interactions

### 2.1 Evidence Library View (`/dashboard/evidence/page.tsx`)

A dedicated dashboard page for managing reusable proof items.

- **Header**:
  - Breadcrumb: `Dashboard` > `Evidence Library`
  - Title: "Evidence Library"
  - Subtitle: "Maintain reusable projects, accomplishments, and portfolio proof across your applications."
  - Primary CTA: "Add Evidence" button (opens `EvidenceFormDialog`).
- **Filter Tabs**:
  - Tab list: `All`, `Projects`, `Accomplishments`, `Portfolio Links` with counts.
- **Card Grid**:
  - Responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).
  - Each item renders `EvidenceCard` with:
    - Type badge (`project`, `accomplishment`, `portfolio_link`).
    - Title (plain text, bold).
    - Description (plain text, truncated preview with expansion if long).
    - Source link (if provided, rendered with external icon, `rel="noopener noreferrer"`, `target="_blank"`).
    - Actions menu or buttons: Edit (opens `EvidenceFormDialog`) and Delete (opens `EvidenceDeleteDialog`).
- **Empty State**:
  - If no items exist, renders `EvidenceEmptyState` with an icon, description, and "Create your first evidence item" button.

---

### 2.2 Opportunity Evidence Section (`OpportunityEvidenceSection`)

Embedded in `/dashboard/opportunities/[opportunityId]/page.tsx` below `RequirementSection`.

- **Card Container**:
  - Header:
    - Title: "Supporting Evidence"
    - Subtitle: "Select relevant projects and proof from your library to include in this application's analysis."
    - Actions:
      - "Attach Evidence" button (opens `EvidencePickerDialog` to select existing items from library).
      - "New Evidence" button (opens `EvidenceFormDialog` with `opportunityId` prop to create and auto-attach).
  - Selected Items List:
    - Renders currently selected evidence items as cards with an explicit "Detach" button.
    - Detaching removes the item from the opportunity's active set with an optimistic update and instant toast notification.
  - Empty State:
    - If 0 items are attached, displays an informational prompt: "No evidence attached to this opportunity yet. Attach relevant projects from your library or add a new one."

---

### 2.3 Modals & Dialogs

#### `EvidenceFormDialog`
- **Trigger**: "Add Evidence", "Edit Evidence", or "New Evidence" (contextual).
- **Form Controls**:
  - Title: Text input, required, max 120 characters, live counter.
  - Type: Radio group or Select (`project`, `accomplishment`, `portfolio_link`).
  - Description: Textarea, required, max 2,000 characters, live counter.
  - Source URL: Text input, optional, placeholder `https://...`, client-side regex check for `https://`.
- **Validation**: Inline errors for required fields, invalid lengths, or non-HTTPS URLs.
- **Submit States**: Loading spinner on save button (`Creating...` / `Saving...`), disables inputs during mutation.

#### `EvidenceDeleteDialog`
- **Trigger**: Delete action on `EvidenceCard`.
- **Lifecycle**:
  - When triggered, invokes `evidence.getAttachedOpportunities({ id })`.
  - While loading associations, shows loading skeleton inside dialog.
  - If `attachedOpportunities.length === 0`:
    - Shows standard confirmation: "Are you sure you want to delete this evidence item from your library? This action cannot be undone."
  - If `attachedOpportunities.length > 0`:
    - Shows prominent warning banner:
      > **Warning**: This item is currently attached to **[N] opportunities**:
      > - [Company A - Role A]
      > - [Company B - Role B]
      > Deleting this item will remove it from your library and detach it from all associated opportunities.
  - Buttons: "Cancel" (dismisses) and "Delete Evidence" (destructive button).

#### `EvidencePickerDialog`
- **Trigger**: "Attach Evidence" button in `OpportunityEvidenceSection`.
- **Content**:
  - Search/filter input to quickly find library items by title.
  - Scrollable list of unattached library items.
  - Each row shows title, type badge, and a "Select" / "Attach" button.
  - Clicking "Attach" triggers `evidence.attach` and transitions the row to "Attached".
  - Dialog close button / "Done" button.

---

## 3. Accessibility & Security Guarantees

1. **Plain Text Security**:
   All evidence titles and descriptions MUST be rendered as plain text strings (`whitespace-pre-wrap`, `break-words`). HTML markup, scripts, or markdown formatting are not parsed as rich elements, preventing injection attacks.
2. **Keyboard Accessibility**:
   - All dialogs trap focus using Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`).
   - `Escape` key closes dialogs cleanly without submitting mutations.
   - Interactive elements have clear `:focus-visible` rings.
3. **Screen Reader Attributes**:
   - Badges have descriptive text labels.
   - External links have `<span className="sr-only">(opens in new tab)</span>`.
   - Counters have `aria-live="polite"` or assistive labels.
