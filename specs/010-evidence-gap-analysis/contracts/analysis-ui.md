# UI Contract: Evidence-Gap Analysis Components & User Interactions

**Feature**: Opportunity Evidence-Gap Analysis  
**Branch**: `010-evidence-gap-analysis`  
**Date**: 2026-09-09  
**Spec**: [spec.md](../spec.md)

---

## 1. Component Hierarchy & Architecture

The Evidence-Gap Analysis UI is located in `components/analysis/` and integrated directly into the opportunity detail workspace (`app/dashboard/opportunities/[opportunityId]/page.tsx`).

```text
components/analysis/
├── analysis-section.tsx              # Root coordinator on opportunity detail page
├── analysis-preflight-dialog.tsx      # Pre-flight readiness check & source disclosure modal
├── analysis-draft-review.tsx          # Interactive uncommitted draft review and override workspace
├── analysis-coverage-summary.tsx      # Deterministic coverage count cards (Supported, Weak, Missing, Unknown)
├── analysis-next-action-card.tsx      # Dedicated Next Action recommendation card
├── analysis-requirement-item.tsx      # Individual requirement coverage & citation card
└── analysis-override-dialog.tsx       # Modal for overriding coverage state & editing citations
```

---

## 2. Component Specifications

### 2.1 `AnalysisSection` (`components/analysis/analysis-section.tsx`)

- **Role**: High-level container component rendering above or beside requirements on the opportunity detail page.
- **States**:
  - `Unanalyzed`: Prominently invites the user to run their first evidence-gap analysis with pre-flight status checks.
  - `DraftReview`: Displays the active `AnalysisDraftReview` interface when an analysis run has completed and is awaiting user confirmation.
  - `Analyzed`: Displays `AnalysisCoverageSummary`, `AnalysisNextActionCard`, and an action to re-run analysis (noting if materials have changed since `lastAnalyzedAt`).
  - `Loading`: Displays progress indicator and informative phase labels ("Analyzing requirements against materials...", "Verifying citations...").
  - `Error`: Displays an alert banner with retry button without losing user position.

---

### 2.2 `AnalysisPreflightDialog` (`components/analysis/analysis-preflight-dialog.tsx`)

- **Role**: Pre-flight verification dialog triggered before initiating an analysis.
- **Prerequisites Checked**:
  - Requirements: At least 1 approved requirement exists.
  - Résumé: Uploaded, extracted text is in `ready` state, and `aiOptIn` is true.
  - Daily limit: Remaining quota > 0.
- **Source Disclosure**:
  - Shows clear count of sources being sent: 1 Job Description, 1 Reviewed Résumé, N Selected Evidence Items, M Opted-In Feedback Items.
  - Reassures user that unselected evidence and un-opted feedback are excluded.
- **Actions**:
  - "Start Analysis" button (enabled only when prerequisites are met).
  - Quick action to enable résumé AI opt-in if currently disabled.
  - "Cancel" button.

---

### 2.3 `AnalysisDraftReview` (`components/analysis/analysis-draft-review.tsx`)

- **Role**: Full-width review workspace where the candidate inspects and overrides the uncommitted AI draft before anything is saved to the database (Constitution Principle II).
- **Features**:
  - Live summary counts that recalculate in real-time as the user overrides states.
  - Interactive coverage override controls for every requirement (`supported`, `weak`, `missing`, `unknown`).
  - Editable citation notes and missing evidence explanations.
  - Editable Next Action card allowing custom text or re-targeting to another weak/missing requirement.
  - Action bar with:
    - "Save Assessment": Persists confirmed states and updates the opportunity.
    - "Discard Draft": Aborts review and leaves previous state intact.

---

### 2.4 `AnalysisCoverageSummary` (`components/analysis/analysis-coverage-summary.tsx`)

- **Role**: Displays 4 deterministic summary cards displaying the exact counts of requirements in each state:
  - **Supported** (Green badge/border, check-circle icon): Direct, cited proof found in candidate materials.
  - **Weak** (Amber badge/border, alert-triangle icon): Partial or indirect evidence found.
  - **Missing** (Red badge/border, x-circle icon): Evidence searched for but absent across submitted materials.
  - **Unknown** (Slate badge/border, help-circle icon): Ambiguous or insufficient information to determine.

---

### 2.5 `AnalysisNextActionCard` (`components/analysis/analysis-next-action-card.tsx`)

- **Role**: Prominently features the **single** bounded next action recommendation.
- **Elements**:
  - "Recommended Next Action" header with target requirement pill.
  - Action description text (plain text).
  - Clarification disclaimer: "This is a concrete, bounded improvement task designed to strengthen your application materials. SearchTrace does not calculate ATS scores or guarantee hiring outcomes."

---

### 2.6 `AnalysisRequirementItem` (`components/analysis/analysis-requirement-item.tsx`)

- **Role**: Renders an individual requirement's coverage evaluation within the requirement list.
- **Elements**:
  - Requirement title, category badge, and job description excerpt.
  - Coverage state badge (`Supported`, `Weak`, `Missing`, `Unknown`).
  - Verbatim citation callout with source attribution pill (`Reviewed Résumé`, `Project: ...`, `Feedback: ...`).
  - Missing evidence notes (for `missing` or `unknown` states).
  - Optional override trigger allowing post-save adjustments.

---

## 3. Accessibility & Safe Data Rendering

1. **ARIA Roles & Headings**:
   - Section uses `<section aria-labelledby="analysis-heading">`.
   - Modals use Radix Dialog primitives (`Dialog`, `DialogTitle`, `DialogDescription`).
   - Summary counts announced with `aria-live="polite"` when overridden during draft review.
2. **Keyboard Navigation**:
   - All interactive badges, overrides, and action buttons are focusable with visible focus rings.
   - Dialog traps focus and supports `Esc` key to close.
3. **Plain-Text Sanitization**:
   - All text (job description excerpts, citations, next action, limitations) is rendered in standard text elements with `whitespace-pre-wrap` styling, completely preventing HTML/script execution.
