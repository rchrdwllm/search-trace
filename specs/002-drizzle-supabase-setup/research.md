# Phase 0 Research: Drizzle and Supabase Setup

## Decisions

### 1. Keep Supabase Data API configuration public and PostgreSQL configuration server-only

**Decision**: Retain `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the existing browser/server Supabase factories. Add one blank, non-public `DATABASE_URL` placeholder for the Supabase direct PostgreSQL URL used by migrations and the new dormant database factory. Do not add `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or a second runtime-pooler variable in this feature.

**Rationale**: Supabase’s current Next.js guide specifies the two public variables, while its database connection guide recommends a direct connection for migrations. The current feature has no runtime database queries, so adding a pooler-specific setting prematurely would add scope without user value. A future deployment/runtime-data feature may add a pooler configuration and must disable prepared statements if it uses Supavisor transaction mode.

**Alternatives considered**:

- Add a service-role/secret key now — rejected because no scoped requirement needs admin access and such keys bypass the intended public-access boundary.
- Add both `DATABASE_URL` and `DATABASE_DIRECT_URL` now — rejected because no runtime query yet needs a separate pooler setting; a single direct URL makes the initial migration target unambiguous.
- Use only Supabase’s browser Data API for all data access — rejected by the PRD, which requires Drizzle for server-side database access and migrations.

**Sources**: [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

### 2. Use Drizzle’s code-first, reviewed migration workflow as the sole schema authority

**Decision**: Use `lib/db/schema.ts` as the canonical application schema, `drizzle/` for committed generated SQL and metadata, `drizzle-kit generate` to create change artifacts, and a guarded migration runner based on Drizzle’s migrator to apply them. Drizzle’s migration ledger is the sole applied-change record; do not also apply the same schema through Supabase CLI migrations.

**Rationale**: Generated migrations provide inspectable, version-controlled changes. Drizzle’s migration journal records applied migrations, so re-running a completed migration set applies only pending work. A guarded runner can validate the selected URL and redact errors before attempting the connection.

**Alternatives considered**:

- `drizzle-kit push` for shared environments — rejected because it bypasses the committed, reviewable migration artifact required by the specification.
- Supabase CLI migration history plus Drizzle-generated migrations — rejected because two migration owners can diverge.
- Manual dashboard SQL edits — rejected by the PRD and because they cannot be reliably reviewed or replayed.

**Sources**: [Drizzle + Supabase setup](https://orm.drizzle.team/docs/get-started/supabase-new), [Drizzle migration generation](https://orm.drizzle.team/docs/drizzle-kit-generate), [Drizzle migration application](https://orm.drizzle.team/docs/drizzle-kit-migrate).

### 3. Use `postgres` with a guarded `server-only` Drizzle factory

**Decision**: Add `postgres` and `drizzle-orm`; create the driver and typed Drizzle instance only in `lib/db/index.ts`, which imports `server-only` first. A pure configuration validator returns only a normalized URL or a credential-safe error. No route, layout, page, or client component imports this module in this feature.

**Rationale**: Drizzle’s Supabase guide demonstrates the `postgres` driver and requires `prepare: false` only for transaction-pooler use. Next.js documents `server-only` as the guard against accidental client import and inlines only `NEXT_PUBLIC_` variables into browser code.

**Alternatives considered**:

- A browser-reachable shared database module — rejected because it could expose a connection credential or direct database access.
- An eager database singleton at module import — rejected because the shell must make zero database connections until a future server operation requests one.
- Configuring database values through `next.config.ts` — rejected because that mechanism exposes configured values to browser JavaScript.

**Sources**: [Drizzle + Supabase setup](https://orm.drizzle.team/docs/get-started/supabase-new), [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables), [Next.js server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

### 4. Verify migrations offline with PGlite and use an explicit manual Supabase check for connectivity

**Decision**: Add a Node-environment PGlite test that initializes an empty in-memory database, applies the committed migration set twice, and verifies the Drizzle migration ledger/baseline. Keep a separate, opt-in quickstart procedure for a disposable Supabase project using `DATABASE_URL`; it is not part of the default test command.

**Rationale**: PGlite verifies migration mechanics with no network, credential, Docker, or shared-database risk. It cannot prove Supabase-specific extensions, Auth, RLS, or network connectivity, so the manual disposable check remains necessary before a shared environment is changed.

**Alternatives considered**:

- Require a hosted Supabase project for every test — rejected because it makes the foundation non-deterministic, slow, credential-dependent, and unsafe for contributors.
- Use Docker Postgres as the default — rejected because the repository’s normal checks are intended to run without a local service runtime.
- Treat PGlite success as RLS or Supabase integration proof — rejected because it does not model those provider features.

**Sources**: [Drizzle PGlite connection](https://orm.drizzle.team/docs/connect-pglite), [Supabase Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres).

### 5. Install the requested project skills before follow-on database work

**Decision**: The first implementation task will run the exact user-provided commands below from the repository root, review the resulting `skills-lock.json` and added skill directories, and record failures without modifying backend configuration as a workaround.

```shell
bunx skills add https://github.com/lobehub/lobehub --skill drizzle
bunx skills add https://github.com/supabase/agent-skills --skill supabase
```

**Rationale**: The user explicitly requested these skills, and Supabase recommends its agent skills to provide current procedural guidance for authentication, server-side rendering, and database migrations.

**Alternatives considered**:

- Skip the skills because the code can be implemented from package docs — rejected because the user explicitly requested the project-local guidance.
- Install an MCP connection to a live Supabase project — rejected because it requires separate project authorization and is outside this setup feature.

**Sources**: [Supabase AI tooling](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#4-set-up-ai-tooling-optional), [OpenAI Skills API reference](https://developers.openai.com/api/reference/typescript/resources/skills/methods/list).

## Resolved Unknowns

All technical-context decisions are resolved. Provider project URL, publishable key, and database password are intentionally unavailable until a contributor configures their private `.env.local`; they are deployment inputs, not implementation questions.

