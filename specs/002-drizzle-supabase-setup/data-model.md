# Data Model: Drizzle and Supabase Setup

## Scope Boundary

This feature establishes schema tooling, not the SearchTrace domain model. It must not add `profiles`, opportunities, résumés, evidence, feedback, requirements, user data, or row-level-security policies. Those entities need their own feature plan with owner-scoping and cross-user denial tests.

## Configuration Model

| Setting | Classification | Required by | Validation | Persistence |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Existing Supabase browser/server factories | HTTPS URL, or local HTTP loopback | `.env.local`; empty placeholder in `.env.example` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Existing Supabase browser/server factories | Non-blank | `.env.local`; empty placeholder in `.env.example` |
| `DATABASE_URL` | Server-only credential | Drizzle migration runner and future server-only database factory | Non-blank `postgres:` or `postgresql:` URL with host, user, password, and database path; error names only the setting | `.env.local`; empty placeholder in `.env.example` |

`DATABASE_URL` is a Supabase direct PostgreSQL connection string in this feature. It is not prefixed with `NEXT_PUBLIC_`, included in browser-facing modules, or injected through `next.config.ts`.

## Schema Artifacts

| Artifact | Location | Source of truth | Lifecycle |
|---|---|---|---|
| Application schema declaration | `lib/db/schema.ts` | Drizzle TypeScript schema exports | Initially empty; later domain features add tables and constraints through reviewed changes. |
| Migration configuration | `drizzle.config.ts` | Drizzle Kit configuration | Points to the schema declaration and `drizzle/` output. |
| Migration files and snapshots | `drizzle/` | Generated and reviewed Drizzle artifacts | Committed. A generated or custom no-op baseline may establish the empty application schema; future schema changes add ordered SQL changes. |
| Applied migration ledger | `drizzle.__drizzle_migrations` in each target database | Drizzle migrator | Created/updated only by the one Drizzle migration workflow; not checked into the repository. |

## Relationships and State

- One checked-in schema declaration produces zero or more checked-in migration artifacts.
- A migration artifact is applied at most once per target database, identified by the Drizzle ledger.
- A database target is either **unconfigured**, **configured but not contacted**, **baseline applied**, or **history inconsistent/failed**.
- The default shell always remains **unconfigured but functional**: it neither constructs a PostgreSQL client nor makes a remote call.

## Validation Rules

- Validation trims whitespace, rejects missing values and unsafe/non-PostgreSQL URL schemes, and never embeds the candidate value in an error.
- The migration runner validates `DATABASE_URL` before constructing a connection, identifies that the target must be disposable or reviewed, and exits unsuccessfully on migration failure.
- The generated migration artifact and source schema are both reviewed before the migration runner is invoked for a shared target.
- PGlite only verifies database-independent migration mechanics; it does not mark Supabase Auth, RLS, storage, or user isolation as complete.

