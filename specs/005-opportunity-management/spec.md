# Feature Specification: Opportunity Management

**Feature Branch**: `master` (no specification hook created a feature branch)

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Let's implement opportunity management: Create, list, view, edit, and delete an opportunity with company, role, job description, URL, and status. Story 2 — “Capture one opportunity” in the @[docs/prd/prd.md] , under User Experience & Functionality → User Stories and Acceptance Criteria."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture a New Opportunity (Priority: P1)

As a signed-in job seeker, I can save a job role, company name, and pasted job description with an optional source link and status so that I can evaluate my materials against a specific target application.

**Why this priority**: Creating an opportunity is the prerequisite anchor for all downstream résumé evaluation, evidence mapping, and gap analysis.

**Independent Test**: An authenticated user fills out the new opportunity form with company, role, and job description, submits it, and is taken to the newly created opportunity's detail page with all submitted details visible.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the new opportunity form, **When** they enter a valid company name, role title, and pasted job description and submit, **Then** the system saves the opportunity with a default status of "draft", associates it with the user, and navigates to its detail view.
2. **Given** an authenticated user providing optional fields, **When** they include a valid `https:` source URL and select a status (such as "applied" or "interviewing"), **Then** the system records those values and displays them on the detail view.
3. **Given** a submission missing required fields (empty company, empty role title, or empty job description), **When** the user attempts to submit, **Then** the system blocks creation, highlights the missing fields with clear guidance, and preserves any entered text.
4. **Given** a source URL that does not use the `https:` scheme or is malformed, **When** the user submits the form, **Then** the system rejects the input and informs the user that source URLs must be valid secure links (`https://...`).

---

### User Story 2 - Browse Saved Opportunities on the Dashboard (Priority: P1)

As a signed-in job seeker, I can view my list of opportunities on my private dashboard so that I can select an opportunity to work on or review its current status.

**Why this priority**: The dashboard is the primary landing area where users manage their applications and track their progress across individual opportunities.

**Independent Test**: Navigate to the dashboard with existing saved opportunities; verify that all owned opportunities are listed showing company, role, status badge, and most recent analysis state indicator, and that clicking any entry opens its detail view.

**Acceptance Scenarios**:

1. **Given** an authenticated user with one or more saved opportunities, **When** they navigate to the dashboard, **Then** they see their opportunities listed with company name, role title, status indicator, and last analysis state, ordered chronologically with the most recently updated opportunities first.
2. **Given** an authenticated user with no saved opportunities, **When** they navigate to the dashboard, **Then** they see an empty-state message with a clear call-to-action button to create their first opportunity.
3. **Given** a user viewing the dashboard list, **When** they select an opportunity, **Then** they navigate directly to that opportunity's detail page.

---

### User Story 3 - View Opportunity Details (Priority: P1)

As a signed-in job seeker, I can inspect the full details of a saved opportunity so that I can read the complete job description, verify application details, and prepare materials.

**Why this priority**: Users need a single source of truth for an opportunity's captured job requirements before attaching evidence or requesting analysis.

**Independent Test**: Open an existing opportunity's detail page and confirm that company, role title, full pasted job description, status badge, and source link render accurately and safely as plain text.

**Acceptance Scenarios**:

1. **Given** an existing opportunity owned by the user, **When** the user views its detail page, **Then** the system displays the company name, role title, current status, full job description, and any provided source URL.
2. **Given** an opportunity with a source URL, **When** displayed, **Then** the link is rendered as an external link configured to open safely in a new tab without script execution risk.
3. **Given** a job description containing special characters, line breaks, or attempted HTML markup, **When** displayed, **Then** the system renders the content safely as plain text, preserving intended whitespace and paragraphs.

---

### User Story 4 - Edit Opportunity Details and Status (Priority: P2)

As a signed-in job seeker, I can update the information and status of an existing opportunity so that my records remain accurate as my application progresses or if the job requirements are revised.

**Why this priority**: Application statuses change (e.g., from draft to applied or interviewing) and job postings may update; users must be able to keep their records accurate without recreating them.

**Independent Test**: Update the role title, company, job description, source link, and status on an existing opportunity; verify that the changes are saved and reflected immediately on both the detail page and the dashboard.

**Acceptance Scenarios**:

1. **Given** an existing opportunity, **When** the owner modifies any field (company, role, job description, source URL, or status) with valid input and saves, **Then** the opportunity updates immediately and displays the revised information.
2. **Given** an update that clears a required field (e.g., leaving the job description or role empty) or provides an invalid URL, **When** the user attempts to save, **Then** the update is prevented, validation messages identify the problem, and existing data remains unaltered.
3. **Given** an edit form with unsaved changes, **When** the user cancels editing, **Then** no modifications are persisted and the view reverts to its previous state.

---

### User Story 5 - Delete an Opportunity with Confirmation (Priority: P2)

As a signed-in job seeker, I can delete an opportunity I no longer wish to track so that my workspace remains clean and relevant.

**Why this priority**: Users need control over their private data and the ability to remove test, duplicate, or irrelevant job opportunities.

**Independent Test**: Trigger deletion of an opportunity, confirm the prompt, and verify that the opportunity is removed from the user's dashboard and can no longer be accessed.

**Acceptance Scenarios**:

1. **Given** an existing opportunity, **When** the owner initiates deletion, **Then** the system presents an explicit confirmation prompt warning that the action is permanent.
2. **Given** an active confirmation prompt, **When** the user confirms deletion, **Then** the opportunity is removed from the workspace and the user is redirected to the dashboard with an affirmative notice.
3. **Given** an active confirmation prompt, **When** the user cancels, **Then** the opportunity is preserved and the user remains on the opportunity page.

---

### User Story 6 - Enforce Private Workspace Boundaries (Priority: P1)

As a signed-in job seeker, I can trust that my opportunities are completely private and that other users cannot view, modify, list, or delete my data.

**Why this priority**: Job search details are sensitive personal data; strict ownership isolation and non-enumeration are fundamental constitutional requirements.

**Independent Test**: Attempt to access, modify, or delete an opportunity belonging to another user using authenticated sessions; verify that all requests are rejected and return a generic unavailable response without disclosing whether the resource exists.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they attempt to access any opportunity page or procedure, **Then** they are redirected to the sign-in screen without exposing any opportunity data.
2. **Given** an authenticated user attempting to view, edit, or delete an opportunity owned by a different user, **When** the request is made, **Then** the system denies access with a generic unavailable response and does not disclose whether the identifier exists.
3. **Given** an authenticated user viewing their dashboard, **When** the opportunity list is loaded, **Then** only opportunities owned by that specific authenticated user are returned.

---

### Edge Cases

- **Extremely long job descriptions**: Job descriptions can span multiple pages of text. The system must accept, store, and display long multi-paragraph job descriptions without UI distortion, horizontal overflow, or silent truncation.
- **Whitespace-only submissions**: Submissions where company, role title, or job description consists solely of spaces, tabs, or newlines must be rejected as empty.
- **Non-HTTPS and malicious URLs**: Source URLs must strictly enforce the `https:` scheme. Protocols like `http:`, `javascript:`, `data:`, or `file:` must be rejected during validation to safeguard against security vulnerabilities.
- **Concurrent or repeated deletion**: If an opportunity is deleted and a user attempts to delete it again or access a cached link, the system must return a clean "unavailable" state without application error.
- **Leading and trailing whitespace**: Names, titles, and URLs must be automatically trimmed of accidental leading/trailing whitespace upon submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create a new job opportunity with company name, role title, and pasted job description.
- **FR-002**: System MUST require non-empty values for company name, role title, and job description, rejecting whitespace-only inputs.
- **FR-003**: System MUST support an optional source URL field that, if provided, validates strictly as a secure `https://` web address.
- **FR-004**: System MUST support user-selected opportunity status restricted to the following values: `draft`, `applied`, `interviewing`, `rejected`, and `closed`.
- **FR-005**: System MUST assign `draft` as the default status when no status is explicitly selected during creation.
- **FR-006**: System MUST list all opportunities belonging to the authenticated user on the private dashboard, displaying company name, role title, status badge, creation date, and most recent analysis state indicator.
- **FR-007**: System MUST provide an accessible empty-state message with a direct action to create an opportunity when the user has zero saved opportunities.
- **FR-008**: System MUST allow an opportunity's owner to view its full details, rendering all user-entered text safely as plain text to prevent script injection.
- **FR-009**: System MUST allow an opportunity's owner to edit any of its attributes (company name, role title, job description, source URL, and status).
- **FR-010**: System MUST apply identical validation rules to opportunity updates as to opportunity creation.
- **FR-011**: System MUST require explicit user confirmation before executing the permanent deletion of an opportunity.
- **FR-012**: System MUST remove deleted opportunities from active listings and redirect the user to the dashboard with an affirmative confirmation message.
- **FR-013**: System MUST enforce strict owner-level authorization on every opportunity read, update, and delete operation.
- **FR-014**: System MUST return an identical, generic "unavailable" response when an opportunity does not exist or is owned by another user, preventing resource enumeration.
- **FR-015**: System MUST NOT implement application timelines, funnel dashboards, derived stage logic, cross-opportunity analytics, or automated job scraping/fetching.

### Key Entities *(include if feature involves data)*

- **Opportunity**: Represents a single targeted software engineering job role tracked by a job seeker.
  - `id`: Unique identifier for the opportunity.
  - `owner`: Reference to the authenticated user who created and owns the opportunity.
  - `company`: Name of the hiring organization (required, plain text).
  - `role`: Title of the job position (required, plain text).
  - `jobDescription`: Complete text of the job description as pasted by the user (required, plain text).
  - `sourceUrl`: Optional web link to the original job posting (optional, valid HTTPS URL).
  - `status`: Current application progress stage (`draft`, `applied`, `interviewing`, `rejected`, `closed`).
  - `createdAt`: Timestamp when the opportunity was first recorded.
  - `updatedAt`: Timestamp when the opportunity was last modified.
  - `lastAnalysisState`: Indicator of whether evidence analysis has been performed (`none`, `pending`, `completed`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated user can create and save a new job opportunity with required fields in under 30 seconds.
- **SC-002**: The private dashboard opportunity list displays up to 50 saved opportunities without horizontal overflow or layout breakage across viewports from 320px to 1440px.
- **SC-003**: 100% of unauthorized attempts to read, edit, or delete another user's opportunity result in a generic unavailable response with 0 data leakage.
- **SC-004**: 100% of user-entered content (company, role, job description) renders as plain text with 0 instances of script injection or HTML interpretation.
- **SC-005**: 100% of deletion attempts require explicit user confirmation before permanent removal.
- **SC-006**: Opportunity management flows execute entirely within the application without relying on external web scrapers, crawlers, or third-party tracking services.

## Assumptions

- Users must be registered and authenticated to access any opportunity management functionality; unauthenticated visitors are redirected to sign-in.
- SearchTrace manages one opportunity at a time; cross-opportunity comparisons, bulk imports/exports, and aggregate tracking funnels are excluded by design.
- Job descriptions are provided manually via copy-and-paste; automatic job scraping or external page extraction is prohibited.
- Source URLs serve solely as informational outbound links for the user; the system does not crawl, ping, or monitor the destination webpage.
- An opportunity will subsequently serve as the parent entity for résumé uploads, evidence items, feedback, and requirement analyses in downstream features (Stories 3, 4, and 5).
