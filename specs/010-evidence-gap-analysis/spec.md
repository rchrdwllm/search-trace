# Feature Specification: Opportunity Evidence-Gap Analysis

**Feature Branch**: `010-evidence-gap-analysis`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "let's implement evidence gap analysis to compare approved requirements against resume text and evidence. It should return validated coverage state, citations, limitations, and one next action. You may also refer to the PRD for more details. Its requirements are primarily covered by: Primary Flow, steps 6–8 — drafting requirements, assigning coverage states, and producing one next action. Story 6 — Review an explainable evidence-gap analysis — especially the acceptance criteria for coverage states, citations, user edits, and next actions. AI Responsibilities and Boundaries — the AI assesses evidence and suggests one next action. Output and Validation — the structured output includes coverage state, citations, limitations, and the next action."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Explainable Evidence-Gap Analysis with Verbatim Citations, Limitations, and One Next Action (Priority: P1)

As a signed-in job seeker viewing a target opportunity with approved requirements and an uploaded résumé, I want to initiate an explainable evidence-gap analysis that compares my approved role requirements against my reviewed résumé text and explicitly selected supporting evidence, so that I receive an objective assessment drafting a coverage state and verbatim citations for each requirement, stated assessment limitations, and exactly one bounded next action to improve my application.

**Why this priority**: This is the core value proposition of SearchTrace. In accordance with PRD Primary Flow (steps 6–8), PRD User Story 6, and Constitution Principle I (Evidence Before Inference) and Principle IV (Bounded and Honest AI), job seekers need a transparent, cited evaluation that distinguishes supported qualifications from weak or missing areas without generic flattery, fabricated claims, or ATS score gimmicks.

**Independent Test**: Navigate to an opportunity with approved requirements and a reviewed résumé (with AI opt-in enabled), click "Run Analysis", and observe that the system evaluates every approved requirement, assigns a coverage state (`supported`, `weak`, `missing`, or `unknown`), provides verbatim cited excerpts from the candidate's materials for supported/weak items, notes searched-but-missing evidence for missing items, documents assessment limitations, and provides exactly one bounded next action tied to a weak or missing requirement.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an opportunity with at least one approved requirement and a reviewed résumé whose AI opt-in is enabled, **When** they initiate evidence-gap analysis, **Then** the system initiates evaluation using only the current opportunity's job description, reviewed résumé text, explicitly attached supporting evidence items, and explicitly opted-in employer feedback.
2. **Given** an analysis request in progress, **When** the assessment is drafted, **Then** every approved requirement is assigned exactly one coverage state: `supported`, `weak`, `missing`, or `unknown`.
3. **Given** a requirement assessed as `supported` or `weak`, **When** inspected, **Then** the assessment includes at least one verifiable, verbatim quotation cited directly from the candidate's reviewed résumé or selected supporting evidence (or opted-in feedback) identifying the source of the quote.
4. **Given** a requirement assessed as `missing`, **When** inspected, **Then** the assessment explicitly identifies what expected qualification or evidence was searched for across the candidate's supplied materials but not found.
5. **Given** a requirement where candidate materials are ambiguous, incomplete, or insufficient to evaluate, **When** inspected, **Then** the assessment assigns the `unknown` coverage state with an explanation of why coverage cannot be determined.
6. **Given** an analysis result, **When** reviewed, **Then** it contains stated limitations and caveats detailing the boundaries of the analysis (e.g., that evaluation is bounded solely by provided text and does not imply human recruiter intent).
7. **Given** an analysis result, **When** inspected for recommendations, **Then** it provides exactly one bounded next action, and that action specifically references an identified weak or missing requirement.
8. **Given** the proposed next action, **When** its text is evaluated, **Then** it is framed strictly as a concrete, bounded improvement task (e.g., "Add a deployed project example demonstrating distributed caching") and contains no promises, guarantees, interview probabilities, or hiring outcome predictions.
9. **Given** freshly generated analysis results, **When** delivered to the user, **Then** they appear in a reviewable draft state awaiting human confirmation, leaving persistent source records unchanged.
10. **Given** an opportunity with attached supporting evidence items, **When** analysis is executed, **Then** the AI systematically cross-references the attached evidence items (including project descriptions and URLs) against all requirements, elevating coverage and citing evidence item titles when proof is found.

---

### User Story 2 - Transparent Pre-Flight Verification and Data Disclosure (Priority: P1)

As a signed-in job seeker preparing to run an analysis, I want to clearly see which source materials will be included in the AI evaluation and confirm that prerequisites are met, so that I maintain informed consent and control over the private data shared with the AI service.

**Why this priority**: In accordance with Constitution Principle III (Privacy, Isolation, and Explicit Consent) and PRD Section 3 (Authorized Inputs), users must have full transparency regarding what materials are sent to the AI. Unselected evidence library items and non-opted-in feedback must never be transmitted.

**Independent Test**: Open the analysis dialog or prompt area on an opportunity, verify that the pre-flight check clearly summarizes the included sources (reviewed résumé status, number of attached evidence items, number of opted-in feedback items), blocks execution with clear guidance if the résumé is missing or unreviewed or has AI opt-in disabled, and requires the user to acknowledge the data transmission before proceeding.

**Acceptance Scenarios**:

1. **Given** an opportunity where the résumé has not been uploaded, or where extraction is still pending or failed, **When** the user views the analysis action, **Then** the analysis action is disabled with an explanatory message indicating that a reviewed résumé is required.
2. **Given** an opportunity where the résumé has been uploaded and reviewed but résumé AI opt-in is disabled, **When** the user attempts to run analysis, **Then** the system prompts the user with explicit consent guidance to enable AI opt-in before proceeding.
3. **Given** an opportunity with zero approved requirements, **When** the user views the analysis action, **Then** the action is disabled with guidance directing the user to extract or add requirements first.
4. **Given** an opportunity ready for analysis, **When** the user initiates the analysis flow, **Then** the interface presents a clear pre-flight summary identifying all materials to be included: the job description, the reviewed résumé, the exact count and titles of attached evidence items, and any opted-in employer feedback.
5. **Given** unselected evidence items in the user's personal evidence library, **When** the analysis request is prepared, **Then** unselected library items are completely excluded from the request payload.
6. **Given** employer feedback items on the opportunity whose AI opt-in is disabled, **When** the analysis request is prepared, **Then** those feedback items are completely excluded from the request payload.

---

### User Story 3 - Review, Correct Coverage States, and Save Final Assessment (Priority: P1)

As a signed-in job seeker, I want to review the drafted coverage states, citations, and next action, and have the ability to override any coverage state or adjust the action before saving, so that the finalized assessment reflects my validated judgment rather than uninspected AI conjecture.

**Why this priority**: In accordance with Constitution Principle II (Human Review and Control), AI output must begin as a draft and user-confirmed records are the system of record. Job seekers must have the final word on how their evidence is categorized.

**Independent Test**: Generate a draft analysis, open the interactive review interface, manually change a requirement's coverage state from `weak` to `supported`, adjust the rationale or citation notes, edit the next action text, click save, and verify that the saved assessment records persist the user's modifications.

**Acceptance Scenarios**:

1. **Given** an opportunity with an uncommitted draft analysis, **When** the user reviews the assessment, **Then** each requirement displays its proposed coverage state (`supported`, `weak`, `missing`, `unknown`), its cited verbatim excerpts, and any notes on missing evidence.
2. **Given** a draft requirement coverage evaluation, **When** the user selects an alternative coverage state, **Then** the requirement's state updates immediately in the review view to reflect the user's selection.
3. **Given** a draft assessment, **When** the user reviews the proposed next action, **Then** the user can edit the action description or re-link it to a different weak or missing requirement.
4. **Given** reviewed analysis results, **When** the user clicks "Save Assessment" (or "Accept Assessment"), **Then** the system persists the confirmed coverage states, citations, stated limitations, and final next action, and records the analysis timestamp on the opportunity.
5. **Given** an active uncommitted draft, **When** the user chooses "Discard Draft" or leaves the screen without saving, **Then** the draft changes are discarded and the opportunity's prior state remains unaltered.

---

### User Story 4 - Inspect Opportunity Coverage Summary and Actionable Next Step (Priority: P2)

As a signed-in job seeker reviewing an analyzed opportunity, I want to view a clear summary showing deterministic coverage counts across my requirements alongside the single next action card, so that I can immediately understand my evidence posture and know the exact next task to work on.

**Why this priority**: A key product promise is clarity and focus. Providing deterministic counts (supported, weak, missing, unknown) and one prominent, bounded next action prevents cognitive overload and keeps the candidate focused on their most impactful improvement.

**Independent Test**: Navigate to a previously analyzed opportunity, verify that the coverage summary displays accurate counts for each coverage state, that all requirements show their confirmed status and source citations, and that the Next Action card prominently displays the single bounded improvement task linked to its target requirement.

**Acceptance Scenarios**:

1. **Given** an opportunity with a saved assessment, **When** the user views the opportunity detail page, **Then** the page displays a summary breakdown with the exact counts of `supported`, `weak`, `missing`, and `unknown` requirements.
2. **Given** an opportunity with a saved assessment, **When** the user views the requirements section, **Then** each requirement visibly indicates its confirmed coverage state with distinct styling, its cited source excerpts, and any associated limitations.
3. **Given** an opportunity with a saved assessment, **When** the user views the Next Action section, **Then** exactly one next action card is shown, highlighting the specific recommendation, referencing the target weak or missing requirement, and clarifying that it is an improvement task rather than an outcome guarantee.
4. **Given** an opportunity with existing saved analysis, **When** the user uploads a new résumé, changes evidence selections, or edits requirements, **Then** the system indicates that existing coverage was computed from an earlier version and allows the user to re-run the analysis.
5. **Given** an opportunity with attached evidence items, **When** the user views the analysis summary or draft review, **Then** the interface displays an evidence contribution indicator showing how many attached evidence items were cited as proof and highlighting which items contributed.

---

### User Story 5 - Enforce Daily Analysis Quotas, Verifiable Citations, and Private Data Isolation (Priority: P1)

As a system owner and job seeker, I want the system to enforce strict daily usage limits, verify citation authenticity against source text, and safeguard private data across user boundaries, so that the service remains sustainable, trustworthy, and completely private.

**Why this priority**: Constitution Principle I requires evidence before inference, Principle III mandates private isolation, and Principle IV enforces rate limits (5 requests/day) and failure resilience. Fabricated citations and cross-user leaks are unacceptable failure modes.

**Independent Test**: Trigger an analysis that exhausts the daily allowance and verify that subsequent attempts are blocked with quota guidance; verify that non-verbatim citations fail server validation; verify that another user cannot view or trigger an analysis on an opportunity they do not own.

**Acceptance Scenarios**:

1. **Given** an authenticated user who has performed 5 analysis operations within a 24-hour UTC window, **When** they attempt another analysis, **Then** the system rejects the request, displays a daily quota exceeded notice, and informs the user when the quota resets.
2. **Given** an analysis result produced by the AI provider, **When** processed by the server, **Then** the server verifies that every cited excerpt for `supported` and `weak` requirements exists verbatim in the candidate's reviewed résumé or selected evidence items; if any citation cannot be verified, the validation fails and the unverified result is rejected.
3. **Given** a service timeout, rate limit error, model failure, or validation failure during analysis, **When** the failure occurs, **Then** the system leaves all existing opportunity data, requirements, and source materials untouched, displays a clear, actionable error message, and provides an explicit retry option.
4. **Given** an authenticated user attempting to run analysis on, or view analysis results of, an opportunity owned by another user, **When** the request is made, **Then** the system responds with an identical unavailable resource error without confirming existence.
5. **Given** any analysis processing, **When** operational logs are written, **Then** no raw résumé text, job descriptions, evidence descriptions, feedback text, AI prompts, or raw model outputs appear in the logs.
6. **Given** user-authored and AI-generated text displayed anywhere in the analysis interface, **When** rendered on screen, **Then** all text is rendered safely as plain text to prevent script injection.

---

### Edge Cases

- **Opportunity has no weak or missing requirements (all requirements `supported`)**: The system assigns `supported` to all requirements; the single next action focuses on maintaining strong positioning or deepening demonstrable evidence for the role rather than hallucinating artificial deficiencies.
- **Candidate materials have zero match to requirements (all requirements `missing` or `unknown`)**: The system marks requirements as `missing` or `unknown`, notes the absence of relevant evidence across submitted materials, and suggests a concrete starting action targeting the highest-priority missing requirement without disparaging language.
- **Opportunity has no supporting evidence items attached**: The system performs the analysis using only the job description and reviewed résumé text; requirements not covered by the résumé evaluate to `missing` or `unknown`.
- **Opp-in feedback is present**: The system considers opted-in employer feedback as a reported signal for context; feedback is never treated as causal proof of why an applicant was rejected or selected.
- **AI model outputs multiple next actions**: The server-side validation strictly enforces exactly one next action; drafts with multiple actions or missing actions are rejected during validation.
- **AI model suggests a next action tied to an already `supported` requirement when weak or missing requirements exist**: The server-side validation requires the next action to target a weak or missing requirement if any exist.
- **Candidate edits an evidence item after an analysis was saved**: The saved analysis remains unchanged as an immutable historical record of that run; the user is alerted that source materials have changed and can re-run analysis if desired.
- **Candidate deletes a requirement that was targeted by the saved next action**: The next action retains its saved text, and the target requirement reference gracefully falls back to general guidance or prompts re-analysis.
- **Network interruption during analysis request**: The server transaction does not corrupt existing data, and the client displays a retry prompt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to execute an evidence-gap analysis for an opportunity they own.
- **FR-002**: The system MUST verify that the target opportunity has at least one approved requirement and a reviewed résumé in the `ready` state with explicit AI opt-in enabled before permitting analysis execution.
- **FR-003**: The system MUST present a pre-flight data disclosure summarizing all source materials to be included in the analysis (job description, reviewed résumé, attached evidence item count/titles, and opted-in feedback count) and require user confirmation before transmitting data.
- **FR-004**: The system MUST include only the job description, reviewed résumé text, explicitly attached supporting evidence items, and explicitly opted-in employer feedback for the opportunity in the AI evaluation; unselected evidence library items and un-opted feedback MUST be excluded.
- **FR-005**: The analysis evaluation MUST assign exactly one coverage state to every evaluated requirement: `supported`, `weak`, `missing`, or `unknown`.
- **FR-006**: Every `supported` or `weak` coverage evaluation MUST include at least one verbatim citation quoted word-for-word from the candidate's reviewed résumé or selected supporting evidence (or opted-in feedback), along with identification of the source.
- **FR-007**: The server MUST verify that every cited excerpt exists verbatim in the candidate's authorized source text before accepting the analysis; citations that fail verification MUST cause validation failure.
- **FR-008**: Every `missing` coverage evaluation MUST specify what evidence was sought across the candidate's supplied materials but was not found.
- **FR-009**: The analysis evaluation MUST assign `unknown` when candidate materials are ambiguous or provide insufficient context to determine coverage.
- **FR-010**: The analysis evaluation MUST include stated limitations highlighting the contextual constraints and boundaries of the automated evaluation.
- **FR-011**: The analysis evaluation MUST propose exactly one bounded next action formulated as a concrete, achievable improvement task tied to a weak or missing requirement (or general deepening if all requirements are supported).
- **FR-012**: The next action MUST NOT contain promises of hiring success, interview probabilities, ATS match percentages, or causal claims regarding hiring decisions.
- **FR-013**: The system MUST present newly generated analysis output in a reviewable draft state, keeping prior saved assessments and source records unmodified until user confirmation.
- **FR-014**: The system MUST allow users to interactively review the draft, change the coverage state of any requirement, edit cited notes or limitations, and edit or re-target the next action.
- **FR-015**: The system MUST persist the finalized assessment only upon explicit user confirmation, saving confirmed coverage states, citations, limitations, the next action, and the analysis timestamp.
- **FR-016**: The opportunity view MUST display deterministic summary counts for each coverage state (`supported`, `weak`, `missing`, `unknown`) alongside the requirement cards and the dedicated next action card.
- **FR-017**: The system MUST enforce a configurable daily limit of five (5) analysis requests per user per day, tracking usage transparently and communicating quota status and reset timing to the user.
- **FR-018**: Any AI failure, quota exhaustion, network timeout, or schema validation error MUST preserve existing opportunity and source data, display a user-friendly explanation, and provide an explicit retry option.
- **FR-019**: The system MUST enforce strict user ownership across all analysis operations, returning an identical unavailable resource error on any unauthorized cross-user access.
- **FR-020**: The system MUST render all user-provided, AI-generated, and citation text safely as plain text to prevent script execution.
- **FR-021**: Operational logs MUST NOT contain raw résumés, job descriptions, evidence descriptions, feedback text, prompts, or model outputs.
- **FR-022**: The system MUST NOT browse the web, fetch external URLs, rewrite résumés, submit job applications, generate cover letters, or compute ATS scores (strict adherence to PRD MVP non-goals).
- **FR-023**: The system MUST systematically evaluate all attached supporting evidence items (`project`, `accomplishment`, `portfolio_link`) alongside the reviewed résumé. When a requirement is not fully satisfied by the résumé, or when an attached evidence item provides deeper, concrete implementation proof, the AI analyzer MUST cross-reference the attached evidence item and cite it with its title and verbatim excerpt.
- **FR-024**: The system MUST pass each attached evidence item's `sourceUrl` (when present) into the AI analysis context, and the analysis summary and review interfaces MUST present evidence utilization indicators showing which attached evidence items contributed citations.

### Key Entities

- **Opportunity**: Target job opportunity record owned by a user, containing role details, job description, status, analysis timestamp, and analysis metadata (limitations, next action).
- **Requirement**: An approved qualification, skill, or responsibility for an opportunity. In the context of evidence-gap analysis, each requirement maintains an assigned coverage state (`supported`, `weak`, `missing`, `unknown`), citation details (source reference and verbatim excerpt), missing evidence notes, and assessment rationale.
- **Evidence Gap Assessment**: The comprehensive evaluation result for an opportunity, comprising coverage decisions across all approved requirements, deterministic summary counts, stated limitations, and exactly one next action.
- **Next Action**: A single, concrete, bounded improvement recommendation tied to a specific weak or missing requirement, designed to guide the candidate's next practical step before applying or interviewing.
- **User Daily Usage**: A tracking record recording the count of analysis operations executed by an authenticated user within the current 24-hour UTC window to enforce the 5 requests/day limit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can initiate and view a complete evidence-gap analysis draft in under 15 seconds under normal network and provider conditions.
- **SC-002**: 100% of generated `supported` and `weak` coverage evaluations cite verified, verbatim excerpts from candidate-supplied materials.
- **SC-003**: 100% of generated analyses produce exactly one bounded next action, and 100% of next actions reference an identified weak or missing requirement (unless all requirements are supported).
- **SC-004**: 100% of user overrides to coverage states and the next action during draft review are faithfully preserved upon saving the assessment.
- **SC-005**: 100% of analysis requests exclude unselected evidence library items and non-opted-in employer feedback.
- **SC-006**: 100% of cross-user attempts to run or access analyses are rejected with an unavailable resource response without leaking resource existence.
- **SC-007**: 100% of failed requests (provider error, timeout, quota limit, citation mismatch) leave existing opportunity and source data completely intact.
- **SC-008**: 100% of users reaching the 5-request daily limit are blocked from running further analyses until quota reset, with zero overages.

## Assumptions

- The user has created an opportunity and established at least one approved requirement (either extracted from the job description or manually added).
- The user has uploaded a résumé for the opportunity, the text extraction is in the `ready` state, and the user has granted explicit AI opt-in consent for that résumé.
- Supporting evidence items in the library and employer feedback items are optional; an analysis can proceed with only the job description, approved requirements, and reviewed résumé.
- Analysis evaluations operate on a single opportunity at a time; cross-opportunity comparisons and aggregate applicant tracking are strictly excluded.
- The external AI provider adheres to server-side structured output constraints, and any output violating the schema is caught and handled server-side before reaching the user.
