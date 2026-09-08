# Feature Specification: Requirement Extraction from Job Description

**Feature Branch**: `007-requirement-extraction`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "let's implement now requirement extraction from the docs/prd/prd.md based on user story 5, citing requirements from the job description. Refer to the PRD for more details."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract Draft Requirements with Verbatim Job Description Citations (Priority: P1)

As a signed-in job seeker viewing a saved opportunity, I want to request an automated requirement extraction from the job description so that the core qualifications, responsibilities, and skills are extracted as 5–12 distinct requirements, each citing an exact verbatim excerpt from the employer's posting.

**Why this priority**: In accordance with Constitution Principle I (Evidence Before Inference) and PRD User Story 5, extracting cited requirements establishes the verifiable foundation for all subsequent evidence-gap evaluations. Without extracted and cited requirements, no gap analysis is possible.

**Independent Test**: Navigate to an opportunity with a pasted job description, trigger requirement extraction, and observe that the system generates 5 to 12 draft requirements across standard categories, each displaying an exact substring quote from the job description.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an opportunity with a valid job description (≥ 50 characters), **When** they initiate requirement extraction, **Then** the system drafts between 5 and 12 requirements, categorizing each into one of `technical_skill`, `experience`, `education`, `responsibility`, or `other`.
2. **Given** any extracted requirement produced by the system, **When** inspected, **Then** it includes an exact, verbatim text excerpt cited directly from the opportunity's job description.
3. **Given** an extraction result from the model, **When** validated by the server, **Then** the system verifies that each cited excerpt exists verbatim in the job description; any requirement with a hallucinated or non-matching citation fails validation.
4. **Given** freshly generated extraction results, **When** displayed to the user, **Then** they appear in an uncommitted "draft" state, visually distinct from saved records, awaiting user review.
5. **Given** an authenticated user who has reached their daily analysis limit (5 requests per day), **When** they attempt to extract requirements, **Then** the system prevents execution and displays a clear notification stating the daily limit and when it resets.
6. **Given** an extraction request in flight, **When** a service timeout, provider error, or network failure occurs, **Then** the system leaves all existing opportunity data untouched, displays a user-friendly error explanation, and provides an explicit retry button.

---

### User Story 2 - Review, Edit, and Save Requirements (Priority: P1)

As a signed-in job seeker, I want to review the drafted requirements and edit their text, category, or citation excerpt before saving them, so that I retain full human control over the criteria used to evaluate my background.

**Why this priority**: Constitution Principle II (Human Review and Control) mandates that AI output begins as a draft and that user-confirmed records are the true system of record. Users must be able to refine and approve requirements.

**Independent Test**: View drafted requirements, edit the text and category of one requirement, adjust a citation, click save/confirm, and verify that the requirements persist as confirmed records on the opportunity.

**Acceptance Scenarios**:

1. **Given** an opportunity with drafted requirements, **When** the user reviews them, **Then** each requirement is displayed in an editable card or list item showing its title/description, category badge, and cited job-description excerpt.
2. **Given** a draft requirement, **When** the user edits the requirement text or changes its category (`technical_skill`, `experience`, `education`, `responsibility`, `other`), **Then** the edits are reflected in the review interface.
3. **Given** a draft requirement, **When** the user edits the citation excerpt, **Then** the system verifies that the updated excerpt exists verbatim in the job description before allowing the change to be saved.
4. **Given** a set of reviewed draft requirements, **When** the user clicks "Save Requirements" (or "Accept Draft"), **Then** the requirements are persisted as confirmed records for that opportunity, transitioning out of the draft state.
5. **Given** uncommitted draft requirements, **When** the user clicks "Discard Draft" or navigates away without saving, **Then** the uncommitted draft is dismissed and any previously saved requirements remain unchanged.

---

### User Story 3 - Add and Delete Individual Requirements Manually (Priority: P2)

As a signed-in job seeker, I want to manually add custom requirements or delete irrelevant drafted requirements, so that the requirement list reflects what is genuinely important for my application strategy.

**Why this priority**: Automated models may capture irrelevant boilerplate (e.g., generic equal opportunity clauses) or miss nuanced expectations discussed with a recruiter. Users must have unilateral authority to add and delete requirements.

**Independent Test**: On the requirement management interface, delete an unwanted draft requirement, add a new custom requirement with a title and category, and verify the resulting list correctly updates the requirement count.

**Acceptance Scenarios**:

1. **Given** an opportunity's requirement list (draft or saved), **When** the user clicks the delete action on a specific requirement, **Then** that requirement is immediately removed from the list.
2. **Given** an opportunity's requirement list, **When** the user chooses to "Add Requirement", **Then** the system presents an input form requiring requirement text and category selection, with an optional verbatim citation excerpt.
3. **Given** a user adding a manual requirement with an optional citation, **When** a citation is provided, **Then** the system verifies that the citation exists verbatim in the opportunity's job description.
4. **Given** an opportunity where requirements have been saved, **When** the user deletes a saved requirement, **Then** the requirement is permanently removed from the opportunity's record upon confirmation.

---

### User Story 4 - Re-extract Requirements with Replacement Confirmation (Priority: P2)

As a signed-in job seeker, I want to re-extract requirements if I update the job description or want a fresh extraction, with an explicit confirmation step so that I do not unintentionally overwrite my manual edits.

**Why this priority**: Users may revise a pasted job description or want to re-run extraction after an initial pass. Safeguarding existing edits with an explicit confirmation dialog prevents accidental data loss.

**Independent Test**: On an opportunity with existing saved requirements, click "Re-extract Requirements", verify that a confirmation dialog warns that existing requirements will be replaced, confirm the prompt, and verify that fresh draft requirements are extracted.

**Acceptance Scenarios**:

1. **Given** an opportunity with existing saved requirements, **When** the user triggers requirement extraction, **Then** the system displays an explicit confirmation dialog warning that re-extracting will replace current requirements.
2. **Given** the re-extraction confirmation dialog, **When** the user confirms, **Then** the system executes extraction and presents the newly drafted requirements for review.
3. **Given** the re-extraction confirmation dialog, **When** the user cancels, **Then** the existing requirements remain completely untouched and no extraction request is sent.

---

### User Story 5 - Enforce Privacy, Owner Isolation, and Safe Display (Priority: P1)

As a signed-in job seeker, I want to trust that my opportunities, job descriptions, and extracted requirements are private to my account, protected against cross-user access, and safely presented.

**Why this priority**: In accordance with Constitution Principle III (Privacy, Isolation, Explicit Consent), user data must be isolated and protected against enumeration, and operational logs must never contain user text or model prompts.

**Independent Test**: Attempt to access, extract, edit, or delete requirements for another user's opportunity and verify a generic unavailable response; inspect logging output to ensure zero raw text leakage.

**Acceptance Scenarios**:

1. **Given** an authenticated user attempting to view, extract, edit, or delete requirements on an opportunity owned by another user, **When** the request is made, **Then** the system returns an identical generic "unavailable" response without disclosing the opportunity's existence.
2. **Given** all user-entered and AI-generated requirement text, categories, and citations, **When** rendered in the interface, **Then** they are rendered strictly as plain text to prevent script injection.
3. **Given** server execution during extraction, validation, and storage, **When** processing requests, **Then** no raw job descriptions, prompts, or model outputs are written to operational server logs.

---

### Edge Cases

- **Job Description Too Short**: A user creates an opportunity with a very brief job description (e.g., "Software engineer wanted, apply now"). When extraction is requested, the system halts with a friendly message explaining that job descriptions must have sufficient detail (at least 50 characters) to extract meaningful requirements.
- **Job Description Lacks Concrete Requirements**: A user pastes marketing fluff or an executive mission statement with no technical skills or qualifications. The model returns fewer than 5 requirements or reports that no distinct qualifications could be identified. The system informs the user and invites them to add requirements manually or paste a more complete job description.
- **Model Generates Hallucinated / Paraphrased Citation**: The model returns a requirement with an excerpt that is paraphrased or fabricated rather than verbatim. Server-side validation detects the missing substring in the job description, rejects the invalid draft requirement, and either prompts a retry or filters it out before user display.
- **Daily Quota Reached**: A user makes 5 extraction requests in a single day. The 6th attempt is blocked on the server with a clear message indicating when the daily limit resets, preserving provider cost controls.
- **Provider Outage or Network Timeout**: The structured-output provider is unreachable or times out (> 30 seconds). The system transitions to an explicit error state with a "Retry Extraction" button, keeping prior saved requirements and the opportunity intact.
- **Pasted Job Description Modified After Requirements Saved**: If a user later edits the opportunity's job description text, existing citations might no longer match. The system gracefully flags affected citations or displays an informational badge suggesting re-extraction.
- **Rich Text or Unusual Formatting in Job Description**: Job descriptions containing bullet characters, emojis, multiple consecutive line breaks, or non-ASCII punctuation are handled cleanly without extraction crashes or citation matching failures.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated opportunity owner to initiate automated requirement extraction from the opportunity's stored job description.
- **FR-002**: The system MUST validate that the opportunity's job description contains at least 50 characters before initiating extraction, rejecting shorter inputs with a descriptive error.
- **FR-003**: The system MUST extract between 5 and 12 distinct requirements per successful extraction request.
- **FR-004**: The system MUST assign each extracted requirement to exactly one of five allowed categories: `technical_skill`, `experience`, `education`, `responsibility`, or `other`.
- **FR-005**: The system MUST require that every extracted requirement contains an exact, verbatim citation excerpt from the opportunity's job description.
- **FR-006**: The system MUST validate server-side that each cited excerpt is an exact verbatim substring of the stored job description before presenting or persisting it.
- **FR-007**: The system MUST present newly extracted requirements in an uncommitted "draft" state that does not overwrite saved records until confirmed by the user.
- **FR-008**: The system MUST allow the user to edit the title, description, category, and citation excerpt of any draft or saved requirement.
- **FR-009**: The system MUST allow the user to manually add new requirements with a title, category, and optional verbatim citation excerpt.
- **FR-010**: The system MUST allow the user to delete any individual requirement from the draft or saved list.
- **FR-011**: The system MUST allow the user to confirm and save the curated requirement list as the authoritative requirements for the opportunity.
- **FR-012**: The system MUST allow the user to discard an uncommitted draft, restoring the opportunity's previous requirement state.
- **FR-013**: The system MUST require explicit user confirmation before replacing existing requirements via re-extraction.
- **FR-014**: The system MUST enforce a configurable daily limit of extraction requests per user, with an initial default of 5 requests per day.
- **FR-015**: The system MUST provide clear error feedback and a retry mechanism when an extraction request fails due to network, timeout, quota, or provider errors.
- **FR-016**: The system MUST leave existing saved requirements and opportunity records unchanged when an extraction request fails.
- **FR-017**: The system MUST enforce strict ownership authorization on all requirement operations (extract, list, edit, add, delete, save).
- **FR-018**: The system MUST return an identical generic "unavailable" response when an opportunity does not exist or is owned by another user.
- **FR-019**: The system MUST render all requirement titles, descriptions, categories, and citations strictly as plain text to prevent script injection.
- **FR-020**: The system MUST NOT log raw job descriptions, requirement extraction prompts, or raw model outputs in operational server logs.
- **FR-021**: The system MUST NOT calculate ATS scores, hiring probabilities, or outcome predictions from extracted requirements (Constitution Principle IV).
- **FR-022**: The system MUST NOT alter the opportunity's title, company, or job description during requirement extraction.

### Key Entities *(include if feature involves data)*

- **Requirement**: Represents a single qualified criterion for an opportunity.
  - `id`: Unique identifier for the requirement record.
  - `opportunityId`: Reference to the parent opportunity. Multiple requirements belong to one opportunity.
  - `userId`: Reference to the authenticated owner.
  - `title`: Concise description or name of the requirement (e.g., "5+ years of TypeScript experience").
  - `category`: Classification enum: `technical_skill`, `experience`, `education`, `responsibility`, or `other`.
  - `jobDescriptionExcerpt`: Verbatim quote from the job description evidencing the requirement.
  - `orderIndex`: Sequential ordering index for display presentation.
  - `createdAt`: Timestamp when the requirement was created.
  - `updatedAt`: Timestamp when the requirement was last updated.

- **RequirementExtractionDraft**: Represents an ephemeral or in-memory draft set of extracted requirements awaiting user review and confirmation before persistence.
  - Contains candidate requirements with category and validated citation excerpts.
  - Not committed to permanent storage until the user explicitly saves/accepts the draft.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Requirement extraction from a typical job description (300 to 1,500 words) completes and displays draft requirements in under 15 seconds.
- **SC-002**: 100% of successfully extracted requirements are classified into one of the five valid categories (`technical_skill`, `experience`, `education`, `responsibility`, `other`).
- **SC-003**: 100% of displayed AI-generated requirement citations match an exact verbatim substring within the opportunity's job description.
- **SC-004**: Users can review, edit, add, or delete requirements and save the confirmed set in under 60 seconds.
- **SC-005**: 100% of unauthorized attempts to view or modify requirements across user boundaries result in a generic "unavailable" response with zero data leakage.
- **SC-006**: 100% of extraction failures (timeouts, quota exhaustion, malformed model output) preserve existing opportunity data with zero corruption or orphan records.
- **SC-007**: 100% of requirement content is rendered as plain text with zero script execution vulnerabilities.
- **SC-008**: The system successfully enforces the 5-request-per-day limit, preventing excess provider expenditure for 100% of exceeding attempts.
- **SC-009**: The requirement review and curation interface is fully responsive and usable across viewports from 320px to 1440px without horizontal clipping or broken layouts.

## Assumptions

- **Language of Job Descriptions**: The initial MVP focuses on English-language job postings.
- **Extraction Independence**: Requirement extraction evaluates the job description independently; it does not require a résumé to be uploaded or analyzed, allowing users to inspect what a job demands before submitting their materials.
- **Verbatim Citations as Source of Truth**: A citation is valid if and only if it is an exact case-sensitive or trimmed substring match within the opportunity's job description text.
- **Structured Output Delivery**: The underlying AI provider supports structured JSON output enforcing the schema requirements (title, category, verbatim excerpt) server-side.
- **Rate Limit Scope**: The daily limit of 5 requests applies per user across all their opportunities, resetting at midnight UTC.
- **Requirement Cardinality**: A standard automated extraction produces 5 to 12 requirements; however, user curation may result in fewer or more total requirements after manual addition or deletion.
- **Downstream Coverage Integration**: Extracted requirements will serve as the target requirements against which résumé evidence and coverage states (`supported`, `weak`, `missing`, `unknown`) are mapped in subsequent gap-analysis features.
