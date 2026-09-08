# Feature Specification: Supporting Evidence Library and Opportunity Selection

**Feature Branch**: `008-supporting-evidence`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "let's implement the \"Supporting Evidence\" module, based on user story 04. Refer to the docs/prd/prd.md for more details."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintain Personal Evidence Library (Priority: P1)

As a signed-in job seeker, I want to create, view, edit, and delete reusable proof items in my personal evidence library (projects, accomplishments, and portfolio links) independently of any specific job opportunity, so that I can catalog my verifiable background once without re-entering the same information for every application.

**Why this priority**: In accordance with PRD User Story 4 and Constitution Principle I (Evidence Before Inference), having a user-owned, reusable evidence repository is essential for grounding gap assessments in verifiable factual proof. Without the library, evidence cannot be selected or evaluated.

**Independent Test**: Navigate to the evidence library, create evidence items of each supported type (`project`, `accomplishment`, `portfolio_link`), edit an existing item, view the item list, delete an unlinked item, and verify that all changes persist correctly in the user's private library.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create an evidence item with a title (1–120 characters), a description (1–2,000 characters), an item type (`project`, `accomplishment`, or `portfolio_link`), and an optional valid HTTPS URL, **Then** the item is successfully saved to their personal evidence library.
2. **Given** an evidence creation or edit request, **When** the title is empty or exceeds 120 characters, the description is empty or exceeds 2,000 characters, or the type is not one of the three allowed types, **Then** the system rejects the request with user-friendly validation errors.
3. **Given** an evidence creation or edit request containing a link, **When** the link does not use the secure `https:` protocol (e.g., `http:`, `javascript:`, or malformed text), **Then** the system rejects the link and requires a secure `https://` web address.
4. **Given** an authenticated user with saved evidence items, **When** they access their evidence library, **Then** all their evidence items are displayed with their title, description, category type, and optional link.
5. **Given** an authenticated user editing an existing evidence item, **When** they submit valid updates, **Then** the library item is updated everywhere it is referenced for future evaluations without altering previously finalized assessments.
6. **Given** an unlinked evidence item in the library, **When** the user initiates deletion and confirms the action, **Then** the item is permanently removed from the user's library.

---

### User Story 2 - Select and Attach Evidence to an Opportunity (Priority: P1)

As a signed-in job seeker tailoring an application, I want to review my evidence library from an opportunity's workspace and select relevant items (or deselect non-relevant items) to include in that opportunity's analysis, so that the assessment evaluates only the proof applicable to that target role.

**Why this priority**: Job seekers apply to varied roles requiring distinct skillsets. Reusable evidence must be flexibly attached or detached on a per-opportunity basis without duplicating or mutating the original evidence items.

**Independent Test**: Open a specific opportunity's workspace, view available library items alongside currently selected items, select multiple items, deselect an item, and confirm that the opportunity's selected evidence list updates immediately and independently of other opportunities.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an opportunity, **When** they access the supporting evidence section, **Then** the interface clearly distinguishes between evidence items currently selected for this opportunity and available unselected library items.
2. **Given** available unselected evidence items in the user's library, **When** the user selects an item for the opportunity, **Then** the item is added to the opportunity's active evidence set without creating a duplicate record in the library.
3. **Given** an evidence item currently selected for an opportunity, **When** the user deselects that item, **Then** the item is detached from the opportunity while remaining completely intact in the personal evidence library.
4. **Given** two distinct opportunities owned by the same user, **When** the user selects an evidence item for the first opportunity, **Then** the second opportunity's selections remain unchanged and independent.
5. **Given** an opportunity with selected evidence items, **When** the user views the opportunity summary, **Then** the selected evidence count and details accurately reflect current selections.

---

### User Story 3 - Create Evidence Directly Within Opportunity Context (Priority: P2)

As a signed-in job seeker working on an opportunity, I want to quickly add a new project or accomplishment without navigating away from the opportunity page, so that I can capture relevant proof immediately while reviewing the job description.

**Why this priority**: Reducing friction when analyzing an opportunity allows job seekers to add missing proof in context. Items added in this way enrich the reusable library for all future applications.

**Independent Test**: From an opportunity's evidence panel, open the creation dialog, fill in a new project's details, save, and confirm that the new item is both added to the personal library and automatically attached to the active opportunity.

**Acceptance Scenarios**:

1. **Given** an authenticated user on an opportunity detail page, **When** they choose to add new evidence, **Then** an evidence creation form is presented within the opportunity context.
2. **Given** valid submission of the contextual evidence creation form, **When** saved, **Then** the system creates the evidence item in the user's personal library and immediately marks it as selected for the current opportunity.
3. **Given** the contextual evidence creation form, **When** the user cancels or dismisses the form, **Then** no new library item is created and the opportunity's selected evidence set remains unchanged.

---

### User Story 4 - Cascade Safe Deletion with Opportunity Warning (Priority: P2)

As a signed-in job seeker managing my evidence library, I want to be warned if an evidence item I want to delete is currently attached to one or more opportunities, so that I do not accidentally remove proof from an active application.

**Why this priority**: Evidence items can be associated with multiple opportunities. Explicit deletion confirmation prevents unintended data loss and ensures users understand that removing an item excludes it from future analyses across all attached opportunities.

**Independent Test**: Attach an evidence item to two different opportunities, trigger deletion from the evidence library, observe the warning dialog noting its association with existing opportunities, confirm deletion, and verify that the item is cleanly detached from both opportunities and removed from the library.

**Acceptance Scenarios**:

1. **Given** an evidence item attached to one or more opportunities, **When** the user requests deletion, **Then** the system displays a confirmation dialog clearly explaining that deleting the item will remove it from all associated opportunities and exclude it from future analyses.
2. **Given** the deletion confirmation dialog, **When** the user confirms deletion, **Then** the evidence item is permanently removed from the library and all its opportunity associations are cleanly deleted.
3. **Given** the deletion confirmation dialog, **When** the user cancels or dismisses the prompt, **Then** the evidence item and all its opportunity attachments remain untouched.

---

### User Story 5 - Enforce Owner Privacy and Safe Data Rendering (Priority: P1)

As a signed-in job seeker, I want my evidence items and opportunity associations to be strictly private to my account, ensuring no other user can view, edit, delete, or associate my evidence with their opportunities.

**Why this priority**: In accordance with Constitution Principle III (Privacy, Isolation, and Explicit Consent), all user data must be strictly scoped to its owner, cross-user enumeration must be prevented, and user content must be rendered safely as plain text.

**Independent Test**: Attempt to view, update, delete, or link another user's evidence item or opportunity; verify that the system returns an identical unavailable response without leaking existence; inspect the UI to verify that HTML or script characters in evidence titles, descriptions, and links are rendered safely as plain text.

**Acceptance Scenarios**:

1. **Given** an authenticated user attempting to view, edit, or delete an evidence item owned by another user, **When** the request is submitted, **Then** the system responds with an unavailable resource error without revealing whether the record exists.
2. **Given** an authenticated user attempting to attach an evidence item they do not own, or attach their evidence item to an opportunity owned by another user, **When** the request is submitted, **Then** the system denies the association and returns an unavailable resource error.
3. **Given** user-authored evidence titles, descriptions, and URLs containing markup or script tags, **When** rendered on any screen, **Then** the content is displayed strictly as plain text, neutralising any potential script execution.
4. **Given** server execution during evidence creation, editing, selection, or deletion, **When** requests are logged, **Then** operational logs contain no raw evidence descriptions or private portfolio links.

---

### Edge Cases

- **Empty Library on Opportunity Page**: When a user views an opportunity but has no evidence items in their library, the supporting evidence section displays an encouraging empty state with a direct action to create their first evidence item.
- **Maximum Lengths Exceeded**: Submissions with titles exceeding 120 characters or descriptions exceeding 2,000 characters are blocked with inline character count feedback.
- **Whitespace-Only Inputs**: Titles or descriptions containing only spaces, tabs, or newlines are treated as empty and rejected.
- **Non-HTTPS URLs**: URLs starting with `http:`, `ftp:`, `javascript:`, `data:`, or raw file paths are rejected. Only valid URLs beginning with `https://` are permitted.
- **Duplicate Association Attempts**: Attempting to attach an evidence item that is already selected for an opportunity is treated as an idempotent success or gracefully prevented in the UI.
- **Deleting an Opportunity**: When an opportunity is deleted, its opportunity-evidence associations are removed, but all underlying evidence items in the user's personal library remain untouched and available for other opportunities.
- **External URL Liveness**: The system does NOT verify if an external HTTPS link is reachable, live, or returns a 200 OK (in strict compliance with PRD non-goals prohibiting web crawling or scraping).
- **Network or Service Disruptions**: If an error occurs while toggling an evidence selection or saving an item, the existing state is preserved, an informative error message is displayed, and the user can retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to maintain a personal evidence library containing reusable proof items independent of any job opportunity.
- **FR-002**: Each evidence item MUST include a title (1–120 characters), a description (1–2,000 characters), an item type, and an optional link.
- **FR-003**: The evidence item type MUST be restricted strictly to one of three values: `project`, `accomplishment`, or `portfolio_link`.
- **FR-004**: If a link is provided on an evidence item, the system MUST validate that it is a properly formatted URL using the `https:` protocol; all other schemes or malformed inputs MUST be rejected.
- **FR-005**: The system MUST allow authenticated users to view, edit, and delete their own evidence items from the library at any time.
- **FR-006**: The system MUST allow authenticated users to associate (select) zero, one, or multiple library evidence items with an opportunity they own.
- **FR-007**: The system MUST allow authenticated users to disassociate (deselect) evidence items from an opportunity without modifying or deleting the underlying library items.
- **FR-008**: The opportunity interface MUST clearly and visibly distinguish between evidence items currently selected for the opportunity and available unselected items in the user's library.
- **FR-009**: The system MUST allow users to create a new evidence item directly from an opportunity's workspace, automatically saving it to the library and selecting it for that opportunity upon successful creation.
- **FR-010**: Editing an evidence item MUST update the item's details across the user's library and apply to future opportunity evaluations without retroactively altering saved past assessments.
- **FR-011**: Deleting an evidence item MUST require explicit user confirmation, permanently remove the item from the library, and remove all its associations across all opportunities.
- **FR-012**: Deleting an opportunity MUST delete only the opportunity-evidence associations for that opportunity, leaving the underlying evidence items in the personal library intact.
- **FR-013**: The system MUST enforce strict owner authorization on all operations: a user can only view, edit, delete, or associate evidence items and opportunities that they own.
- **FR-014**: Any unauthorized access attempt (cross-user read, write, or association) MUST return an identical unavailable resource error without revealing record existence.
- **FR-015**: The system MUST render all user-provided evidence text (titles, descriptions, links) as plain text to prevent script injection.
- **FR-016**: The system MUST NOT automatically fetch, scrape, or verify external evidence URLs, recommend evidence items, or pre-map evidence to specific requirements before analysis (PRD MVP non-goals).

### Key Entities

- **Evidence Item**: A user-owned reusable proof artifact in the personal evidence library. Attributes include a unique identifier, owner identifier, title, detailed description, type (`project`, `accomplishment`, or `portfolio_link`), an optional HTTPS URL, and creation/update timestamps.
- **Opportunity Evidence Association**: A user-owned join entity linking an opportunity to an evidence item. Represents the user's explicit selection of an evidence item as input for that opportunity's evaluation. Requires ownership of both the opportunity and the evidence item.
- **Opportunity**: A user-owned target job application record (company, role, job description, status) that can be associated with multiple evidence items from the user's library.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a new evidence item with a title, description, type, and optional HTTPS link in under 30 seconds.
- **SC-002**: A user can view their library and toggle (select or deselect) 3 evidence items for an opportunity in under 10 seconds.
- **SC-003**: 100% of non-HTTPS URLs, empty titles, whitespace-only inputs, or out-of-bounds texts are rejected on submission with specific, user-friendly validation messages.
- **SC-004**: 100% of cross-user access attempts (reading, editing, deleting, or linking another user's evidence or opportunity) are denied with zero information leakage regarding record existence.
- **SC-005**: Deleting an evidence item removes 100% of its opportunity associations across all opportunities without leaving orphaned records.
- **SC-006**: Editing an evidence item propagates immediately to all unanalyzed views across 100% of associated opportunities without modifying finalized historical assessments.
- **SC-007**: 100% of user-entered evidence text is rendered safely as plain text with zero raw script execution.

## Assumptions

- Users have access to modern, standards-compliant web browsers supporting interactive dialogs, forms, and responsive layouts.
- Users are responsible for providing factual, accurate descriptions of their accomplishments and valid HTTPS portfolio links.
- External URLs provided by users are optional reference links; the system does not crawl, scrape, or verify the external availability or contents of these URLs, in alignment with PRD non-goals.
- Evidence items are completely private to the creating user; there are no shared, public, or team-level evidence libraries in this MVP.
- An opportunity may have zero, one, or multiple evidence items selected for evaluation, with typical applications attaching between 2 and 5 relevant items.
