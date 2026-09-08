# UI & Accessibility Contract: Requirement Management Interface

**Feature**: Requirement Extraction from Job Description  
**Branch**: `007-requirement-extraction`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Component Hierarchy

The requirement extraction and curation interface lives under `components/requirements/` and embeds into the opportunity detail page (`app/dashboard/opportunities/[opportunityId]/page.tsx`):

```text
app/dashboard/opportunities/[opportunityId]/page.tsx
└── OpportunityDetailView
    ├── OpportunityHeader
    ├── ResumeSection (from Feature 006)
    └── RequirementSection (NEW - Feature 007)
        ├── RequirementQuotaAlert (Shows remaining daily extractions or limit reached)
        ├── RequirementDraftBanner (Displays in draft mode with Save and Discard actions)
        ├── RequirementList
        │   ├── RequirementCard (Title, category badge, cited excerpt, edit/delete actions)
        │   └── RequirementEmptyState (Call to action when 0 requirements exist)
        ├── RequirementEditDialog (Modal to edit title, category, and citation)
        ├── RequirementAddDialog (Modal to add manual requirement)
        └── RequirementReextractDialog (Confirmation modal before overwriting existing saved requirements)
```

---

## 2. Visual States & User Workflows

### 2.1 State A: Empty State (No Requirements)
- **Visuals**: A clean card outlining that requirements can be extracted from the job description.
- **Actions**:
  - Button: `"Extract Requirements from Job Description"`.
  - Secondary Button: `"Add Requirement Manually"`.
- **Badges**: Displays daily quota indicator (e.g., `"4 of 5 extractions remaining today"`).

### 2.2 State B: Extracting (Loading)
- **Visuals**: Skeleton cards with an accessible live region (`role="status"`, `aria-live="polite"`): `"Analyzing job description with Gemini 3.6 Flash..."`.
- **Actions**: Trigger buttons are disabled with loading spinners.

### 2.3 State C: Draft Review Mode (Unsaved)
- **Visuals**:
  - Prominent alert banner: `"Reviewing Draft Requirements (Unsaved)"` with an informational note reminding the user to inspect and curate the requirements.
  - Draft requirements rendered as a list of interactive cards.
- **Actions in Banner**:
  - Primary button: `"Save Requirements"`.
  - Secondary button: `"Discard Draft"`.
  - Button: `"+ Add Requirement"`.
- **Card Actions**:
  - `"Edit"` button: Opens `RequirementEditDialog`.
  - `"Delete"` button: Immediately removes the draft requirement.

### 2.4 State D: Saved State
- **Visuals**:
  - Header: `"Role Requirements"` with total count (e.g., `"8 requirements"`).
  - Categorized summary or filter pills (`All`, `Technical Skill`, `Experience`, `Education`, `Responsibility`).
  - Saved requirements displayed with their category badges and cited excerpts.
- **Actions**:
  - Button: `"Re-extract"` (triggers `RequirementReextractDialog`).
  - Button: `"+ Add Requirement"`.
  - Individual item `"Edit"` and `"Delete"` actions.

---

## 3. Accessibility & Keyboard Navigation Requirements

1. **ARIA Live Regions**:
   - Extraction loading, success, and error messages use `<div role="status" aria-live="polite">` or `<div role="alert" aria-live="assertive">`.
2. **Accessible Dialogs**:
   - `RequirementEditDialog`, `RequirementAddDialog`, and `RequirementReextractDialog` use `@radix-ui/react-dialog` with `DialogTitle`, `DialogDescription`, and focus trapped within the modal while open.
   - Pressing `Escape` closes the modal without submitting.
3. **Form Controls**:
   - Category selector uses an accessible `<select>` or `@radix-ui/react-select` with associated `<label>`.
   - Text inputs and textareas have explicit programmatic `<label>` associations (`htmlFor` / `id`).
4. **Citation Quotations**:
   - Cited job-description excerpts use accessible `<figure>` and `<blockquote>` or `<cite>` tags with italicized presentation and distinct border styling (`border-l-2 border-muted-foreground/30 pl-3`).
5. **Safe Plain Text**:
   - All titles, categories, and citations are rendered as standard React text nodes (`{text}`) ensuring full automatic XSS sanitization.
