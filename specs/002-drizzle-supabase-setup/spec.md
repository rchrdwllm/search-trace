# Feature Specification: Drizzle and Supabase Setup

**Feature Branch**: `master` (no specification hook created a feature branch)

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "let's now setup Drizzle and Supabase for the project. You can also plan to add these Drizzle and Supabase skills. Include setup of .env place holders as well."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure a Private Development Environment (Priority: P1)

As a product contributor, I can configure my local copy of SearchTrace with clearly named placeholder values so I can connect to the intended private backend without committing or exposing credentials.

**Why this priority**: Every private authentication, storage, and database feature depends on a safe, repeatable configuration boundary. A mistake here could expose a user’s job-search data or block all later backend work.

**Independent Test**: Starting from a fresh checkout, copy the committed configuration reference, supply valid project values locally, and verify that configuration validation identifies the environment as ready without showing any credential value. Repeat with each required value missing and verify that the guidance identifies only the missing setting.

**Acceptance Scenarios**:

1. **Given** a fresh project checkout, **When** a contributor follows the local-configuration instructions, **Then** they can identify every required value, where to obtain it, and whether it is browser-safe or server-only.
2. **Given** a contributor has copied the configuration reference, **When** they enter local values, **Then** no secret is added to version control and no secret appears in normal validation output.
3. **Given** one required local value is absent or malformed, **When** a backend capability is requested, **Then** the contributor receives actionable remediation guidance without exposing any supplied value.

---

### User Story 2 - Establish a Controlled Data-Schema Baseline (Priority: P1)

As a product contributor, I can define and apply database changes through a reviewed, version-controlled process so every SearchTrace environment can be brought to the same schema without relying on undocumented manual edits.

**Why this priority**: The product’s privacy and ownership requirements require a reliable schema history before user data is introduced. It prevents local, preview, and production environments from silently diverging.

**Independent Test**: With a disposable backend database configured, generate the baseline change set, apply it to an empty database, repeat the application without unintended changes, and verify that the recorded schema matches the declared baseline.

**Acceptance Scenarios**:

1. **Given** an empty disposable database and valid server-only connection settings, **When** a contributor applies the version-controlled baseline, **Then** the database reaches the documented initial state successfully.
2. **Given** a database already at the baseline, **When** the contributor applies the same change set again, **Then** the operation completes without duplicate objects or unintended data changes.
3. **Given** a future schema change is proposed, **When** it is prepared for review, **Then** its declared model and generated change set can be inspected together before it is applied to a shared environment.

---

### User Story 3 - Keep Data Access Private by Design (Priority: P2)

As a security-minded maintainer, I can distinguish browser-safe backend access from server-only database access so privileged database credentials cannot reach users’ browsers or routine logs.

**Why this priority**: SearchTrace handles sensitive résumés and job-search evidence. The configuration and access boundary must support the constitution’s privacy, isolation, and explicit-consent requirements from the first data-related change.

**Independent Test**: Build the application with valid local configuration and inspect browser-delivered assets and validation output to confirm that server-only connection values are absent; exercise a server-side database readiness check and confirm it can use only the server-only configuration.

**Acceptance Scenarios**:

1. **Given** browser-delivered application assets, **When** they are inspected, **Then** they contain no database connection credential or other server-only value.
2. **Given** a server-side data operation is initialized, **When** valid server-only configuration is present, **Then** it can obtain a typed database boundary without creating a browser-side database connection.
3. **Given** a contributor attempts to use a server-only setting in browser-facing code, **When** automated checks run, **Then** the unsafe boundary violation is reported before release.

---

### User Story 4 - Use Maintained Integration Guidance (Priority: P3)

As a product contributor, I can consult the planned Drizzle and Supabase project skills while extending this integration so future work follows current provider guidance instead of relying on stale assumptions.

**Why this priority**: Both services evolve quickly; project-local guidance reduces the chance of using obsolete configuration or migration practices.

**Independent Test**: Install the two planned skills in a contributor environment, invoke each for a relevant follow-on task, and confirm that its guidance is available without changing application credentials or production data.

**Acceptance Scenarios**:

1. **Given** a contributor is preparing a database-related follow-on task, **When** they install the planned integration skills, **Then** Drizzle and Supabase guidance is available in their development environment.
2. **Given** either skill installation cannot complete, **When** the contributor continues the application setup, **Then** the failure is reported as a tooling prerequisite and does not expose credentials or alter a shared backend.

### Edge Cases

- The project configuration is absent, has extra whitespace, points to an invalid endpoint, or contains a placeholder value rather than a real value.
- A contributor has browser-safe backend values but lacks the server-only database connection value; frontend-only work remains possible, while database work fails with targeted guidance.
- A migration is attempted against a non-empty database that does not match its recorded change history; the process stops before making an unreviewed change.
- A contributor accidentally targets a shared environment while testing a generated change; setup documentation makes the target explicit and requires review before shared-environment application.
- Installation of the planned skills is unavailable because a package registry or source repository cannot be reached; no application configuration or remote data is changed as a workaround.

## Requirements *(mandatory)*

### Scope

This feature establishes the private backend and database-development foundation for SearchTrace. It includes local configuration placeholders, safe client and server configuration boundaries, typed database access setup, version-controlled schema-change capability, and verification/documentation for those boundaries.

It excludes end-user authentication screens, protected routes, application domain tables, user data migration, storage operations, résumé handling, AI analysis, and production deployment. Later features must add row-level security, owner-scoped queries, and cross-user authorization coverage before any user-owned data is released.

### Functional Requirements

- **FR-001**: The project MUST provide a committed configuration reference that lists every required backend and database setting with blank or unmistakably non-working placeholder values.
- **FR-002**: The configuration reference and setup documentation MUST distinguish browser-safe settings from server-only settings and identify the source of each required value.
- **FR-003**: The project MUST require browser-safe backend endpoint and publishable-access settings for browser-facing backend capabilities, and server-only database connection settings for database schema and query capabilities.
- **FR-004**: Local configuration files containing supplied credentials MUST be excluded from version control, and documentation MUST instruct contributors never to commit, log, or paste those values into issue trackers or chat.
- **FR-005**: Configuration validation MUST identify missing or malformed required values at the point they are needed, provide remediation guidance, and never include supplied credential values in an error or log message.
- **FR-006**: The project MUST provide a server-only typed database access boundary; browser-facing code MUST not create database connections or receive database connection credentials.
- **FR-007**: The project MUST provide a canonical, version-controlled representation of its database schema and a repeatable process to generate and apply schema changes.
- **FR-008**: The schema-change process MUST record which changes have been applied, be safe to repeat on an unchanged environment, and stop with actionable guidance when the target environment’s recorded history is inconsistent.
- **FR-009**: The initial setup MUST make the database target explicit before applying a change and document a review step before changes are applied to a shared environment.
- **FR-010**: Automated verification MUST cover complete, missing, and malformed configuration; server-only access boundaries; and application of the initial schema baseline to a disposable database.
- **FR-011**: Automated verification MUST confirm that browser-delivered assets and normal error output contain no server-only database connection values.
- **FR-012**: Contributor documentation MUST explain how to configure a local environment, use the schema-change workflow, choose a disposable target for verification, and run the relevant checks.
- **FR-013**: The project’s planned development tooling MUST include installation of the Drizzle and Supabase skills using the user-provided commands before follow-on database work relies on their guidance.
- **FR-014**: This setup MUST not introduce user-owned application records or imply that row-level security, ownership enforcement, authentication, or private storage have been completed.

### Key Entities *(include if feature involves data)*

- **Local configuration reference**: The committed, credential-free list of settings and setup instructions used to create a contributor’s private local environment.
- **Database connection configuration**: Server-only values that select a specific database target and allow schema or typed data access; never browser-delivered.
- **Schema declaration**: The canonical version-controlled description of the database’s intended structure.
- **Schema change set**: A reviewed, ordered record that moves a database from one declared schema state to the next.
- **Migration history**: The record maintained by the target database that identifies which schema change sets have been applied.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new contributor can configure a local disposable backend environment and complete the readiness check in 15 minutes or less using only the documented instructions.
- **SC-002**: One hundred percent of required configuration settings appear in the committed reference with a clear classification as browser-safe or server-only, and the reference contains zero working credentials.
- **SC-003**: All defined missing and malformed configuration cases provide an actionable setting-specific remedy while exposing zero supplied credential values.
- **SC-004**: The initial schema baseline applies successfully to an empty disposable database in 100% of three consecutive test runs and produces no additional changes when immediately re-applied.
- **SC-005**: Automated checks detect 100% of seeded attempts to expose a server-only database setting to browser-facing code or normal error output.
- **SC-006**: In a contributor review using the documented workflow, every proposed shared-environment schema change has an inspectable declaration and change set before application.

## Assumptions

- SearchTrace will use the project’s Supabase backend for authentication, hosted Postgres, row-level security, and private storage, while server-side typed data access and migrations use Drizzle.
- The existing public backend variables remain the browser-safe endpoint and publishable-access placeholders; this feature adds the separate server-only database connection placeholders required by the schema workflow.
- The initial baseline may contain only setup metadata and no user-owned product records; domain tables and their row-level security policies belong to later, explicitly scoped work.
- Contributors will use an isolated, disposable backend database for schema workflow verification and will obtain shared-environment access through the project owner’s established process.
- The following user-provided skill-installation commands are planned prerequisites for follow-on database work and are not executed by this specification:

  ```shell
  bunx skills add https://github.com/lobehub/lobehub --skill drizzle
  bunx skills add https://github.com/supabase/agent-skills --skill supabase
  ```

