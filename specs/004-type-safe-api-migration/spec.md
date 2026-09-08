# Feature Specification: Type-Safe API Migration

**Feature Branch**: `master` (no specification hook created a feature branch)

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "set up tRPC for the project for type-safe APIs. It should migrate existing setup (wherever applicable) to use tRPC from plain server actions and direct db calls. Check docs/prd/prd.md as well."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use One Consistent Application Boundary (Priority: P1)

As a signed-in job seeker, I can use SearchTrace workflows through a consistent application boundary so that forms and screens behave predictably as opportunity, résumé, evidence, feedback, and analysis features are added.

**Why this priority**: The PRD makes this boundary the foundation for every private workflow and requires it before application data operations expand.

**Independent Test**: Exercise every existing user-triggered read and mutation and verify that applicable operations pass through the shared application boundary with unchanged successful outcomes and user-visible errors.

**Acceptance Scenarios**:

1. **Given** an existing user-triggered operation that reads or changes application state, **When** the user performs it after the migration, **Then** it uses the shared application boundary rather than invoking a database operation directly from presentation code.
2. **Given** an operation whose endpoint is owned by an authentication or platform integration, **When** the migration is assessed, **Then** that endpoint remains supported without being forced into an incompatible application procedure.
3. **Given** a new application workflow, **When** it needs server-side data or business behavior, **Then** contributors have one documented and testable way to expose that behavior to the interface.

---

### User Story 2 - Preserve Private, Owner-Scoped Access (Priority: P1)

As a signed-in job seeker, I can trust that every private operation uses my authenticated identity and cannot read or change another user’s records.

**Why this priority**: Résumés, feedback, and job-search evidence are sensitive data, and both the PRD and constitution make cross-user denial a release gate.

**Independent Test**: Attempt representative public, unauthenticated, authenticated-owner, and authenticated-non-owner operations; only the owner’s valid requests succeed.

**Acceptance Scenarios**:

1. **Given** no valid session, **When** a caller requests a protected operation, **Then** access is denied before application data is read or changed.
2. **Given** a valid session for one user, **When** that user attempts to read, update, delete, or relate another user’s record, **Then** the request is denied without revealing private record contents.
3. **Given** a valid record owner and valid input, **When** the owner performs an allowed operation, **Then** it succeeds and affects only owner-scoped data.

---

### User Story 3 - Receive Reliable Validation and Errors (Priority: P2)

As a job seeker, I receive clear, safe outcomes when a request is invalid or a service fails so that I can correct or retry the action without losing source data.

**Why this priority**: Shared validation and predictable failures are necessary for trustworthy forms, uploads, and analysis requests.

**Independent Test**: Submit valid, malformed, unauthorized, duplicate, and service-failure requests and verify stable result categories, helpful recovery guidance, and no sensitive content in responses or logs.

**Acceptance Scenarios**:

1. **Given** malformed or incomplete input, **When** an operation is submitted, **Then** the server rejects it before changing state and identifies correctable fields without exposing internals.
2. **Given** a provider, database, storage, extraction, or quota failure, **When** an operation cannot complete, **Then** source records remain unchanged and the user receives an appropriate retry or recovery path.
3. **Given** sensitive user-authored content, credentials, or internal failure details, **When** an error is reported or logged, **Then** the response and operational logs omit that sensitive content.

---

### User Story 4 - Migrate Without Regressing Existing Authentication (Priority: P2)

As an existing account holder, I can still sign up, sign in, sign out, and access protected routes after the application-boundary migration.

**Why this priority**: Authentication is the only current user mutation flow and establishes the identity required by every protected procedure.

**Independent Test**: Run the existing authentication journeys before and after migration and confirm equivalent session, navigation, validation, and failure behavior.

**Acceptance Scenarios**:

1. **Given** valid registration or sign-in details, **When** the user submits them, **Then** the existing successful session and navigation outcomes are preserved.
2. **Given** invalid credentials or an authentication service failure, **When** the user submits an authentication form, **Then** access remains denied and the existing non-sensitive recovery behavior is preserved.
3. **Given** a signed-in user, **When** the user signs out, **Then** the session ends and private routes remain inaccessible until a new sign-in succeeds.

### Edge Cases

- A request is submitted twice because of a double-click, retry, or unreliable connection; duplicate records or contradictory state are not created.
- A session expires between request initiation and authorization; the operation is denied before protected data changes.
- A valid record identifier belongs to another user; the response does not confirm the record’s private details.
- Input is structurally valid but violates an ownership, relationship, status-transition, file, or daily-limit rule.
- A multi-step mutation fails partway through; the system does not leave source data in a misleading partial state.
- Existing authentication framework endpoints and request-cookie handling cannot safely use the shared application procedure path; they retain their required integration boundary while application-owned behavior remains centralized.
- Server-rendered and interactive consumers request the same operation; both receive equivalent authorization, validation, and error semantics.

## Requirements *(mandatory)*

### Scope

This feature establishes the PRD-required type-safe application API foundation and migrates existing application-owned, user-triggered server operations where that boundary adds consistent validation, authorization, and client/server contracts. It covers shared request context, public and protected operation categories, reusable input validation, standardized safe errors, integration with server-rendered and interactive interfaces, and documented rules for server-only data access.

The migration MUST preserve the current Better Auth identity and session lifecycle established by Specification 003. Authentication-provider endpoints, request-cookie integration, route protection, migration tooling, startup/configuration code, and server-internal adapters MAY remain outside the application procedure layer when they are not application-owned user operations. This feature does not add opportunity, résumé, evidence, feedback, or analysis product workflows, change the database schema, replace Drizzle, Supabase Postgres or Storage, or alter AI behavior.

### Functional Requirements

- **FR-001**: The system MUST provide one shared application-operation boundary for user-triggered server reads and mutations.
- **FR-002**: Every operation MUST declare and enforce server-side input validation before business behavior or state changes occur.
- **FR-003**: Protected operations MUST derive the current identity from the server-validated session and MUST NOT trust a caller-supplied owner identifier as proof of access.
- **FR-004**: Protected operations MUST deny unauthenticated requests before reading or changing private application data.
- **FR-005**: Every operation involving user-owned data MUST verify ownership of the target opportunity or record and scope all reads and mutations to the authenticated owner.
- **FR-006**: Browser-delivered code MUST NOT receive database credentials, create database connections, or invoke the database access layer directly.
- **FR-007**: Presentation components MUST NOT perform direct database operations; applicable user-triggered reads and mutations MUST use the shared application boundary.
- **FR-008**: Database access, storage access, extraction, and provider integrations MUST remain server-only and MUST be invoked through application services or repositories after validation and authorization.
- **FR-009**: The shared boundary MUST expose distinguishable outcomes for invalid input, unauthenticated access, unauthorized or unavailable records, conflicts, rate limits, and unexpected internal failures.
- **FR-010**: User-visible failures MUST provide a safe correction, sign-in, or retry path without disclosing credentials, connection details, private record contents, stack traces, or provider secrets.
- **FR-011**: Operational logging MUST exclude raw résumés, job descriptions, feedback, prompts, model output, passwords, session credentials, and database credentials.
- **FR-012**: Existing registration, sign-in, sign-out, protected-route, safe-return-path, and session-expiry outcomes MUST remain behaviorally compatible through the migration.
- **FR-013**: Operations owned by an authentication or platform integration MUST remain on their required endpoint or request boundary when wrapping them would break session, cookie, streaming, upload, or platform semantics; each retained exception MUST be documented by category and rationale.
- **FR-014**: The project MUST document how contributors define public and protected operations, obtain the current user, validate input, call server-only data services, represent safe failures, and consume operations from server-rendered and interactive interfaces.
- **FR-015**: Automated verification MUST cover shared context creation, public and protected access, input rejection, safe error mapping, session propagation, owner and cross-user access, and representative migrated operations.
- **FR-016**: Migration completeness MUST be checked across existing server actions, route handlers, server-rendered data access, and direct database calls, with every occurrence either migrated or recorded as an intentional server-internal or integration-owned exception.
- **FR-017**: The application boundary MUST support the PRD’s future opportunity, résumé, evidence, feedback, and analysis operations without introducing a second manually maintained client/server contract.
- **FR-018**: A failed validation, authorization, or downstream dependency check MUST leave source records unchanged unless an operation explicitly defines and tests a safe partial outcome.

### Key Entities *(include if feature involves data)*

- **Application operation**: A named, validated server capability available to an approved application consumer; it is classified as public or protected and has defined input, output, and failure behavior.
- **Request context**: Server-derived request information used by operations, including the validated authenticated identity and access to server-only services.
- **Authenticated identity**: The current account and session established by the existing authentication system and used for authorization and ownership checks.
- **Validation contract**: The single server-enforced definition of accepted input whose resulting data shape is shared with approved consumers.
- **Migration inventory item**: An existing server action, route handler, server-rendered read, or direct data-access call classified as migrated, intentionally retained, or obsolete, with a rationale for retained exceptions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of inventoried application-owned, user-triggered server operations are either routed through the shared application boundary or documented as intentional integration exceptions before the feature is accepted.
- **SC-002**: Automated access tests deny 100% of unauthenticated protected requests and 100% of representative cross-user read, update, delete, and relationship attempts.
- **SC-003**: Across all migrated existing authentication journeys, 100% of defined success, validation, navigation, session-expiry, and failure scenarios retain their prior user-visible outcomes.
- **SC-004**: In automated malformed-request tests, 100% of invalid requests are rejected before state changes and return a correctable, non-sensitive outcome.
- **SC-005**: A contributor can add and consume a representative protected operation by following project documentation in 30 minutes or less without defining duplicate client and server data shapes.
- **SC-006**: Review of browser bundles and operational error outputs finds zero database credentials, provider secrets, session credentials, or raw sensitive source content.

## Assumptions

- The PRD-mandated tRPC and Zod stack supplies the shared application boundary and inferred client/server types; this is an implementation constraint explicitly requested for this feature, not an additional product capability.
- Better Auth remains the credential and session authority because the constitution’s approved amendment supersedes the PRD’s older Supabase Auth wording; Supabase remains the Postgres, row-level security, and private-storage platform.
- Drizzle remains the only application database access layer. The migration centralizes how application operations reach it rather than replacing it.
- The current repository contains one plain server-action module for sign-up, sign-in, and sign-out plus server-internal database creation used by authentication; migration planning will classify each operation individually instead of assuming every direct call belongs behind an application procedure.
- No opportunity-domain application queries exist yet, so this feature provides and verifies the protected foundation those later procedures will use.
- Tests for this feature will live under `tests/004-type-safe-api-migration/` in accordance with the constitution.
