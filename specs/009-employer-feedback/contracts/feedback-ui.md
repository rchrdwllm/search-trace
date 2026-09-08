# UI Contract: Employer Feedback Components

**Feature**: Opportunity Employer Feedback and Provenance Preservation  
**Branch**: `009-employer-feedback`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Component Hierarchy

```text
OpportunityDetailPage (app/dashboard/opportunities/[opportunityId]/page.tsx)
└── OpportunityFeedbackSection (components/feedback/opportunity-feedback-section.tsx)
    ├── FeedbackHeader (Section title "Employer Feedback", "Reported Signal" badge, description, "Add Feedback" button)
    ├── FeedbackDisclaimerAlert (Non-causality callout: reported observation, not verified rejection cause)
    ├── FeedbackList (if items exist)
    │   └── FeedbackCard (components/feedback/feedback-card.tsx)
    │       ├── FeedbackCardHeader
    │       │   ├── FeedbackDate & Relative time
    │       │   ├── FeedbackSourceBadge (components/feedback/feedback-source-badge.tsx)
    │       │   ├── FeedbackProvenanceBadge (components/feedback/feedback-provenance-badge.tsx)
    │       │   └── FeedbackActionsMenu (Edit, Delete)
    │       ├── FeedbackCardContent (plain-text rendering with whitespace-pre-wrap and break-words)
    │       └── FeedbackCardFooter
    │           └── FeedbackAiOptInToggle (switch component with accessible label and status indicator)
    ├── FeedbackEmptyState (components/feedback/feedback-empty-state.tsx) (if no items exist)
    ├── FeedbackFormDialog (components/feedback/feedback-form-dialog.tsx) (create/edit modal)
    │   ├── PrivacyGuidanceAlert (advises omitting recruiter contact details, email headers, signatures)
    │   ├── DatePicker / DateInput
    │   ├── SourceTypeSelect (RadioGroup or Select)
    │   ├── ProvenanceSelect (RadioGroup or Select: "Exact Quote" vs "Personal Summary")
    │   ├── FeedbackTextarea (with live character counter up to 5,000 chars)
    │   └── ActionButtons (Cancel, Save)
    └── FeedbackDeleteDialog (components/feedback/feedback-delete-dialog.tsx) (confirmation alert dialog)
```

---

## 2. Component Specifications

### 2.1 `OpportunityFeedbackSection` (`components/feedback/opportunity-feedback-section.tsx`)

- **Role**: Root container embedded into `app/dashboard/opportunities/[opportunityId]/page.tsx`.
- **Data Fetching**: Queries `trpc.feedback.listByOpportunityId.useQuery({ opportunityId })`.
- **States**:
  - `loading`: Renders skeleton pulse placeholder cards.
  - `error`: Renders an accessible alert with a retry button.
  - `empty`: Renders `FeedbackEmptyState` with a direct "Add Feedback" CTA.
  - `success`: Renders the non-causality callout, the list of `FeedbackCard` items, and the "Add Feedback" CTA.
- **Accessibility**:
  - Section wrapped in `<section aria-labelledby="feedback-section-heading">`.
  - Header has `<h2 id="feedback-section-heading">`.

---

### 2.2 `FeedbackCard` (`components/feedback/feedback-card.tsx`)

- **Props**:
  - `item`: `FeedbackItem`
  - `onEdit`: `(item: FeedbackItem) => void`
  - `onDelete`: `(item: FeedbackItem) => void`
- **Interactions**:
  - Displays formatted date (e.g., "Sep 8, 2026").
  - Displays `FeedbackSourceBadge` with readable label:
    - `recruiter_feedback`: "Recruiter Feedback" (blue/indigo accent)
    - `rejection_note`: "Rejection Note" (neutral/slate accent)
    - `interview_feedback`: "Interview Feedback" (emerald/teal accent)
    - `user_summary`: "User Summary" (amber/orange accent)
  - Displays `FeedbackProvenanceBadge`:
    - `exact_quote`: "Exact Quote" (outline, quote icon)
    - `personal_summary`: "Personal Summary" (secondary, notebook icon)
  - Displays `FeedbackAiOptInToggle`:
    - Accessible `<Switch>` with label "Include in AI analysis".
    - Mutation calls `trpc.feedback.setAiOptIn.useMutation()`.
    - Optimistic UI toggle with automatic rollback on error.
  - Plain-text rendering: `<p className="whitespace-pre-wrap break-words text-sm text-foreground">`.
  - Edit & Delete buttons with keyboard accessibility (`Tab`, `Enter`, `Space`).

---

### 2.3 `FeedbackFormDialog` (`components/feedback/feedback-form-dialog.tsx`)

- **Props**:
  - `open`: `boolean`
  - `onOpenChange`: `(open: boolean) => void`
  - `opportunityId`: `string`
  - `initialData?`: `FeedbackItem | null` (if editing)
- **Form Controls**:
  - `PrivacyGuidanceAlert`: Prominent notice:
    > "Privacy Notice: Please do not paste recruiter email addresses, phone numbers, signatures, or private email headers. Keep feedback focused on role and evaluation content."
  - `Date Input`: Defaults to current date (`YYYY-MM-DD`).
  - `Source Type`: Select or Segmented Control:
    - Recruiter Feedback
    - Rejection Note
    - Interview Feedback
    - User Summary
  - `Provenance`: Radio Group:
    - **Exact Quote**: Verbatim excerpt received from employer.
    - **Personal Summary**: User's paraphrased recollection or synthesis.
  - `Textarea`: Multi-line text input with live character counter: `[count] / 5,000`.
  - `Save Button`: Disabled during submission; shows loading spinner.
- **Accessibility**:
  - Accessible Radix Dialog with `DialogTitle`, `DialogDescription`, and focus trapping.
  - Validation error summaries announced via `aria-live="polite"`.

---

### 2.4 `FeedbackDeleteDialog` (`components/feedback/feedback-delete-dialog.tsx`)

- **Props**:
  - `open`: `boolean`
  - `onOpenChange`: `(open: boolean) => void`
  - `item`: `FeedbackItem | null`
  - `onConfirm`: `() => Promise<void>`
- **Behavior**:
  - Accessible Radix AlertDialog.
  - Clarifies that deleting this feedback entry is permanent and will exclude it from all future AI analyses.
  - Red destructive action button.

---

### 2.5 Plain Text & Sanitization Safeguards

- No raw HTML or markdown parsing is applied to feedback text.
- Text is rendered inside standard React DOM text nodes with `whitespace-pre-wrap break-words font-sans`.
- Any `<script>`, `<iframe>`, or HTML tags typed by the user render verbatim as text, neutralising XSS attacks completely.

---

### 2.6 Accessibility & Contrast (WCAG 2.1 AA)

- All badges use color palettes with contrast ratios $\ge 4.5:1$ against the card background.
- Focus outlines use standard ring focus styling (`focus-visible:ring-2 focus-visible:ring-ring`).
- Screen reader announcements for AI toggle state changes.
- Dialogs trap focus and return focus to triggering buttons on close.
