# Phase 0: Technical Research & Architectural Decisions

**Feature**: Opportunity Employer Feedback and Provenance Preservation  
**Branch**: `009-employer-feedback`  
**Date**: 2026-09-08  
**Spec**: [spec.md](./spec.md)

---

## Decision 1: Relational Data Model for Opportunity-Scoped Feedback

- **Decision**: Introduce a dedicated table `feedback_items` in `lib/db/schema.ts` with foreign keys to `opportunities.id` and `user.id`.
- **Rationale**:
  Directly implements PRD Story 5 and the Section 4 Core Data Model (`feedback_items`). An opportunity can receive multiple feedback entries over time (e.g., initial recruiter screen feedback, technical interview notes, final rejection note). Scoping both to `opportunityId` and `userId` with cascading foreign keys (`onDelete: "cascade"`) ensures strict ownership and automatic cleanup if the parent opportunity or user account is deleted.
- **Alternatives Considered**:
  - *Storing feedback as a JSON array or single text column in `opportunities`*: Rejected because it prevents discrete metadata tracking (dates, source types, provenance labels, per-item AI opt-in), complicates individual edits and deletions, and prevents efficient querying.
  - *Creating a reusable global feedback library across opportunities*: Rejected because PRD Story 5 and Constitution Principle I & III define employer feedback as strictly opportunity-specific signals, unlike supporting evidence items which are reusable across the user's search.

---

## Decision 2: Provenance Tracking (`exact_quote` vs. `personal_summary`)

- **Decision**: Require each feedback entry to declare a provenance label restricted to `exact_quote` or `personal_summary`, stored as a validated string enum in Postgres and Zod.
- **Rationale**:
  In accordance with Constitution Principle I (Evidence Before Inference) and PRD Story 5, distinguishing verbatim quotes from personal recollections is critical for grounded analysis. This prevents subjective summaries from being treated as direct employer statements and makes evidence provenance inspectable by the user and downstream AI systems.
- **Alternatives Considered**:
  - *Optional provenance classification*: Rejected because users might neglect to classify provenance, degrading the distinction between verifiable quotes and interpretations.
  - *Free-form provenance tags*: Rejected because standardized classifications are required for consistent UI display and predictable AI prompt formatting.

---

## Decision 3: Source Categorization

- **Decision**: Support four explicit source types: `recruiter_feedback`, `rejection_note`, `interview_feedback`, and `user_summary`.
- **Rationale**:
  Directly adheres to PRD Story 5 acceptance criteria: `source type (recruiter_feedback, rejection_note, interview_feedback, or user_summary)`. This covers all common communication channels across an engineering recruitment lifecycle.
- **Alternatives Considered**:
  - *Free-form source strings*: Rejected to maintain strict type safety, predictable badge rendering, and clean schema validation.

---

## Decision 4: Explicit Default-Off AI Opt-In

- **Decision**: Each feedback item carries an `aiOptIn` boolean column defaulting strictly to `false`. A dedicated tRPC mutation `feedback.setAiOptIn` enables users to toggle AI eligibility per feedback entry.
- **Rationale**:
  In accordance with Constitution Principle III (Privacy, Isolation, and Explicit Consent) and PRD Story 5, employer feedback frequently contains sensitive negotiations, internal company commentary, or confidential correspondence. Content must never reach an external AI provider without conscious, explicit user authorization.
- **Alternatives Considered**:
  - *Global opportunity-level toggle only*: Rejected because a user may wish to opt in a concise interview technical note while excluding a rejection email with personal recruiter remarks. Per-item granularity offers maximum user control.

---

## Decision 5: Non-Causality Framing & Privacy Guidance

- **Decision**:
  1. The UI frames all feedback under a prominent "Reported Signal" heading and renders an informational disclaimer stating that feedback represents reported observations rather than verified rejection causes or hiring probabilities.
  2. The creation and editing forms display an explicit privacy banner asking users not to include recruiter contact details (names, emails, phone numbers), email headers, signatures, or attachments.
  3. Server logs strictly exclude raw feedback text.
- **Rationale**:
  Constitution Principle IV (Bounded and Honest AI) explicitly forbids inferring rejection causes, calculating ATS scores, or making causal claims. PRD Story 5 mandates privacy guidance against contact details and headers.
- **Alternatives Considered**:
  - *Automated PII regex redactor on the server*: Rejected because regex-based scrubbing is brittle, prone to false positives/negatives, and violates the principle of human-in-the-loop validation. Prompting the user with clear instructions and keeping records in plain text is the established architectural pattern in SearchTrace.

---

## Decision 6: Ownership Verification & Non-Enumeration

- **Decision**: All procedures in `feedbackRouter` verify that `ctx.actorId` owns both the target `opportunity` and the specified `feedbackItem`. If unauthorized or missing, the procedure throws `unavailableResource()` (404 NOT_FOUND).
- **Rationale**:
  Constitution Principle III mandates zero cross-user enumeration. Throwing identical 404 errors prevents attackers from determining whether specific feedback or opportunity IDs exist.
- **Alternatives Considered**:
  - *Returning 403 FORBIDDEN for foreign records*: Rejected because 403 confirms the existence of the record, leaking private identifiers.

---

## Decision 7: UI Integration in Opportunity Detail View

- **Decision**:
  Embed `OpportunityFeedbackSection` into `app/dashboard/opportunities/[opportunityId]/page.tsx`, positioned between `OpportunityEvidenceSection` and `RequirementSection`.
- **Rationale**:
  Aligns with the natural application tailoring workflow (PRD Section 2 Primary Flow):
  1. Review Job Description & Application Details
  2. Review Uploaded Résumé (`ResumeSection`)
  3. Attach Supporting Evidence (`OpportunityEvidenceSection`)
  4. Record/Review Employer Feedback (`OpportunityFeedbackSection`)
  5. Conduct Evidence-Gap Analysis & Manage Requirements (`RequirementSection`)
- **Alternatives Considered**:
  - *Separate feedback tab or sub-page*: Rejected because users need a cohesive single-page workspace to see all evidence and signals before initiating analysis.

---

## Decision 8: Offline Test Resilience

- **Decision**: Test suites in `tests/009-employer-feedback/` will execute completely offline using unit mocks and in-memory PGlite database instances, requiring no external network, Supabase service, or credentials.
- **Rationale**:
  Mandated by Constitution Principle V and the repository architecture manual (`AGENTS.md`).
