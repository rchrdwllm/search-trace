# Feature Specification: Opportunity Employer Feedback and Provenance Preservation

**Feature Branch**: `009-employer-feedback`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "let's implement the employer feedback part, to be able to record quoted or summarized feedback, manage AI inclusion, and preserve provenance (story 5), refer to the @[docs/prd/prd.md] for more details."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record and View Opportunity Feedback with Provenance and Privacy Guidance (Priority: P1)

As a signed-in job seeker, I want to record employer feedback for a specific job opportunity—including the date received, the feedback text, the source type, and a required provenance label distinguishing an exact quote from a personal summary—while receiving clear guidance to omit private recruiter contact details and email headers, so that I can preserve an accurate, private record of employer communications.

**Why this priority**: In accordance with PRD User Story 5 and Constitution Principle I (Evidence Before Inference), job seekers need a disciplined way to record employer responses as source facts while clearly separating exact quotes from subjective summaries. This provides the primary factual foundation for any optional future signal analysis.

**Independent Test**: Navigate to an opportunity workspace, open the employer feedback section, fill out the feedback form with a valid date, text, source type (`recruiter_feedback`, `rejection_note`, `interview_feedback`, or `user_summary`), and provenance label (`exact_quote` or `personal_summary`), submit the form, and verify that the feedback entry appears in the opportunity's feedback list with all metadata visibly and accurately displayed.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an opportunity, **When** they add feedback with a valid date, non-empty text (1–5,000 characters), a source type (`recruiter_feedback`, `rejection_note`, `interview_feedback`, or `user_summary`), and a provenance label (`exact_quote` or `personal_summary`), **Then** the feedback item is saved and displayed in the opportunity's feedback list.
2. **Given** an authenticated user on the feedback entry form, **When** viewing the form, **Then** the interface clearly advises the user not to include recruiter contact details, email headers, signatures, or attachments.
3. **Given** a feedback submission, **When** the feedback text is empty, contains only whitespace, or exceeds 5,000 characters, **Then** the system rejects the submission with a clear, user-friendly validation message.
4. **Given** a feedback submission, **When** the source type is not one of the four allowed types or the provenance label is missing/invalid, **Then** the system rejects the submission and requires valid selections.
5. **Given** an opportunity with existing feedback items, **When** the user views the opportunity, **Then** each feedback entry clearly displays its date, text, source category, and provenance badge (`Exact Quote` or `Personal Summary`).

---

### User Story 2 - Manage AI Inclusion with Explicit Default-Off Opt-In (Priority: P1)

As a signed-in job seeker, I want employer feedback to be excluded from AI analysis by default, with an explicit opt-in toggle per feedback item, so that sensitive communications are never transmitted to third-party AI models without my conscious consent.

**Why this priority**: In accordance with Constitution Principle III (Privacy, Isolation, and Explicit Consent) and PRD Story 5, employer communications often contain sensitive personal information. AI inclusion must be strictly opt-in and off by default.

**Independent Test**: Create a feedback item, verify that its AI opt-in status defaults to disabled (`false`), toggle the opt-in state to enabled, and confirm that the change is persisted immediately; toggle it back to disabled and verify that the feedback is excluded from any pending AI payload.

**Acceptance Scenarios**:

1. **Given** a newly created feedback item, **When** saved, **Then** its AI opt-in setting defaults strictly to disabled (`false`).
2. **Given** an existing feedback item with AI opt-in disabled, **When** the user toggles AI opt-in on, **Then** the item is marked as eligible for inclusion in future AI analyses for this opportunity.
3. **Given** an existing feedback item with AI opt-in enabled, **When** the user toggles AI opt-in off, **Then** the item is immediately excluded from future AI analyses for this opportunity.
4. **Given** an opportunity feedback list, **When** displayed, **Then** the UI clearly indicates the AI inclusion state for each feedback item with an accessible switch or toggle.

---

### User Story 3 - Edit and Delete Opportunity Feedback (Priority: P2)

As a signed-in job seeker, I want to edit existing feedback details or delete feedback that was entered erroneously or is no longer relevant, so that my opportunity record stays up to date and deleted items are permanently removed from future analyses.

**Why this priority**: Users need human control (Constitution Principle II) to correct transcription mistakes, adjust provenance classifications, or remove outdated notes. Deletion must cleanly prevent any future evaluation of the removed feedback.

**Independent Test**: Edit the text, source type, or provenance of an existing feedback item and verify the updates are reflected; initiate deletion, confirm the prompt, and verify that the feedback item is permanently removed from the opportunity.

**Acceptance Scenarios**:

1. **Given** an existing feedback item, **When** the user edits its date, text, source type, or provenance label and submits valid data, **Then** the feedback item updates accordingly.
2. **Given** an existing feedback item, **When** the user triggers deletion, **Then** the system presents a confirmation dialog explaining that deletion is permanent and excludes the item from future analyses.
3. **Given** the deletion confirmation dialog, **When** the user confirms deletion, **Then** the feedback item is permanently removed from the opportunity.
4. **Given** the deletion confirmation dialog, **When** the user cancels or dismisses the prompt, **Then** the feedback item remains untouched.

---

### User Story 4 - Strict Owner Authorization and Privacy Protection (Priority: P1)

As a signed-in job seeker, I want my feedback entries to be strictly private to my account and scoped to my opportunity, ensuring that no other user can view, edit, delete, or link feedback to opportunities they do not own.

**Why this priority**: Employer feedback is confidential personal data. Cross-user isolation and non-enumerating error handling are mandatory security gates (Constitution Principle III).

**Independent Test**: Attempt to view, create, edit, delete, or toggle AI opt-in for a feedback item belonging to another user or on an opportunity owned by another user; verify that the system returns an unavailable resource response without leaking whether the record exists; verify that rendered feedback text neutralizes HTML and script tags.

**Acceptance Scenarios**:

1. **Given** an authenticated user attempting to view, edit, delete, or toggle AI opt-in on a feedback item owned by another user, **When** the request is made, **Then** the system returns an unavailable resource error without revealing the record's existence.
2. **Given** an authenticated user attempting to create a feedback item on an opportunity owned by another user, **When** the request is made, **Then** the system denies the operation and returns an unavailable resource error.
3. **Given** feedback text containing markup, HTML elements, or script tags, **When** rendered on any screen, **Then** the content is displayed strictly as plain text, preventing any script execution.
4. **Given** operational logging during feedback operations, **When** requests or errors are logged on the server, **Then** logs contain no raw feedback text, recruiter names, or sensitive communication details.

---

### User Story 5 - Frame Feedback Honestly as Reported Signal (Priority: P2)

As a signed-in job seeker, I want feedback presented strictly as a reported signal rather than verified causality or proof of rejection reasons, so that I understand feedback represents unverified observations rather than absolute facts about hiring outcomes.

**Why this priority**: Constitution Principle IV (Bounded and Honest AI) and PRD Story 5 explicitly mandate that employer feedback must never be presented as proof of a rejection cause or hiring probability.

**Independent Test**: Inspect the feedback UI across opportunity views; verify that feedback is framed with a "Reported Signal" heading and carries an explicit informational note clarifying that feedback reflects reported comments rather than verified hiring causes.

**Acceptance Scenarios**:

1. **Given** an opportunity detail view containing employer feedback, **When** displayed, **Then** the section is labeled as "Reported Signals" or "Employer Feedback (Reported Signal)" with an explanatory note stating that feedback reflects reported observations rather than verified rejection causes.
2. **Given** any feedback display or metadata badge, **When** rendered, **Then** the system displays no score, rejection-probability calculation, or causal claim.

---

### Edge Cases

- **Empty Feedback List**: When an opportunity has no recorded feedback, the section displays an informative empty state explaining the benefits of capturing employer feedback and providing a direct action to add the first entry.
- **Whitespace-Only Text**: Feedback text consisting solely of spaces, tabs, or newlines is rejected as empty.
- **Excessive Text Length**: Submissions exceeding 5,000 characters are rejected with inline character-count guidance.
- **Future Dates**: Dates set significantly in the future (e.g., beyond today's date) are flagged with validation feedback to prevent accidental misdating.
- **Opportunity Deletion**: When an opportunity is deleted, all feedback items associated with that opportunity are automatically deleted via cascade.
- **Multiple Feedback Items**: An opportunity can support multiple feedback entries (e.g., recruiter phone screen feedback, followed by technical interview feedback, followed by final decision feedback), each with independent dates, sources, provenance labels, and AI opt-in toggles.
- **Sensitive Contact Information**: The UI provides prominent warnings reminding users to strip recruiter emails, phone numbers, and signatures; if entered, the content is rendered purely as plain text without active links.
- **Network or Mutation Failures**: If a network failure occurs during creation, update, or deletion, existing state remains unchanged and the user is presented with a clear retry option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to record employer feedback entries scoped strictly to an opportunity they own.
- **FR-002**: Each feedback entry MUST include a feedback date, feedback text (1–5,000 characters), a source type, and a provenance label.
- **FR-003**: The source type MUST be restricted strictly to one of four values: `recruiter_feedback`, `rejection_note`, `interview_feedback`, or `user_summary`.
- **FR-004**: The provenance label MUST be restricted strictly to one of two values: `exact_quote` or `personal_summary`.
- **FR-005**: The feedback creation and editing interfaces MUST display explicit privacy guidance advising users not to include recruiter contact details, email headers, signatures, or attachments.
- **FR-006**: The system MUST track AI opt-in inclusion per feedback item, defaulting strictly to excluded (`false`) upon creation.
- **FR-007**: The system MUST allow authenticated users to toggle the AI opt-in status of each feedback item independently.
- **FR-008**: The system MUST allow authenticated users to view all feedback entries recorded for an opportunity they own.
- **FR-009**: The system MUST allow authenticated users to edit the date, text, source type, and provenance label of existing feedback entries for an opportunity they own.
- **FR-010**: The system MUST allow authenticated users to delete a feedback entry after explicit confirmation, permanently removing the record.
- **FR-011**: Deleting an opportunity MUST automatically cascade-delete all feedback items belonging to that opportunity.
- **FR-012**: The system MUST enforce strict user ownership on all feedback operations; users MUST only access or mutate feedback on opportunities they own.
- **FR-013**: Any unauthorized access attempt across users MUST return an identical unavailable resource error without leaking record existence.
- **FR-014**: The feedback interface MUST visibly frame feedback as a "Reported Signal" with an informational disclaimer stating that employer feedback represents reported observations rather than proven causality for hiring decisions.
- **FR-015**: The system MUST render all feedback text safely as plain text to prevent script injection or unwanted markup formatting.
- **FR-016**: Operational logs MUST NOT contain raw feedback text, recruiter names, or sensitive communication details.

### Key Entities

- **Feedback Item**: An opportunity-scoped, user-owned record of employer communication. Attributes include:
  - Unique identifier
  - Reference to the parent opportunity (`opportunityId`)
  - Reference to the owner (`userId`)
  - Feedback date (date feedback was received or recorded)
  - Feedback text (plain text content of the quote or summary, 1–5,000 characters)
  - Source type (`recruiter_feedback`, `rejection_note`, `interview_feedback`, `user_summary`)
  - Provenance label (`exact_quote`, `personal_summary`)
  - AI opt-in status (boolean, default `false`)
  - Timestamps (created at, updated at)
- **Opportunity**: The parent job application record to which feedback items are scoped.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can record a new employer feedback item with date, text, source type, and provenance label in under 30 seconds.
- **SC-002**: 100% of newly created feedback items have AI opt-in disabled (`false`) by default.
- **SC-003**: 100% of unauthorized cross-user access attempts (viewing, editing, deleting, or adding feedback to another user's opportunity) are denied with zero information leakage.
- **SC-004**: 100% of feedback submissions with empty text, whitespace-only text, text exceeding 5,000 characters, or invalid source types/labels are rejected with specific validation messages.
- **SC-005**: When a feedback item is deleted, it is 100% permanently removed and excluded from all future analyses.
- **SC-006**: When an opportunity is deleted, 100% of its associated feedback items are cleanly deleted via cascade.
- **SC-007**: 100% of feedback text is rendered safely as plain text with zero script injection vulnerabilities.
- **SC-008**: 100% of feedback UI views display visible provenance labeling (`Exact Quote` or `Personal Summary`) and prominent "Reported Signal" framing with non-causality disclaimers.

## Assumptions

- Users enter feedback manually by pasting excerpts or writing personal summaries; the system does not integrate with external email providers, browser extensions, or automated message scrapers (in compliance with PRD non-goals).
- Feedback entries are strictly scoped to a single opportunity and are not shared across multiple opportunities or other user accounts.
- The feedback date represents the approximate or exact date when the feedback was communicated or recorded by the user.
- Feedback items with AI opt-in enabled will be made available for inclusion in structured AI analysis payloads once the analysis feature ingests feedback signals.
