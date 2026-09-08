# Schema Workflow Contract

## Ownership

Drizzle is the sole owner of SearchTrace application-schema migration generation and application. Supabase hosts the PostgreSQL database; it must not maintain a competing migration history for the same application schema.

## Commands

| Command | Input | Behavior | Network requirement |
|---|---|---|---|
| `bun run db:generate -- --name <change-name>` | Updated `lib/db/schema.ts` | Creates inspectable SQL and metadata under `drizzle/` | None |
| `bun run db:migrate` | Reviewed `drizzle/` artifacts and `DATABASE_URL` | Validates the selected target and applies only unapplied migrations | Required; explicitly selected disposable/reviewed target |
| `bun run test -- tests/002-drizzle-supabase-setup/migrations` | Checked-in migration artifacts | Applies the baseline twice to fresh PGlite storage and verifies the ledger | None |

## Rules

1. Every schema change starts by editing the canonical Drizzle schema declaration.
2. The contributor generates a migration, reviews the declaration and generated SQL/metadata together, and commits them in the same change.
3. `db:migrate` does not run until `DATABASE_URL` is present and the contributor has intentionally selected the target. It rejects invalid configuration without printing it.
4. Reapplying an unchanged migration set is safe: the Drizzle migration ledger causes previously applied migrations to be skipped.
5. A migration-history inconsistency, failed statement, or unreachable target exits unsuccessfully and leaves diagnostic output free of credentials. The contributor resolves the discrepancy before retrying.
6. `drizzle-kit push`, dashboard-only schema edits, and application of the same schema by Supabase CLI migrations are outside the approved workflow.
7. Before a shared environment is changed, a reviewer verifies the schema declaration, generated artifacts, target environment, user-data/RLS impact, and rollback/remediation approach. This setup feature has no user tables to migrate.

## Initial Baseline

The initial baseline records an intentionally empty application schema and establishes Drizzle’s migration ledger when applied. It is sufficient to verify the toolchain and idempotent migration path, but it does not represent completed authentication, RLS, storage, or product schema work.

