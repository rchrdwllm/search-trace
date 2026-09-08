# Implementation Plan: Drizzle and Supabase Setup

**Branch**: `002-drizzle-supabase-setup` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-drizzle-supabase-setup/spec.md`

## Summary

Add a secure, server-only Drizzle PostgreSQL foundation alongside the existing public Supabase client factories. The implementation will add credential-free environment placeholders; a validated database configuration and typed connection factory; a schema/migration scaffold owned exclusively by Drizzle; offline migration verification with PGlite; contributor documentation; and the two requested project skills. It deliberately creates no SearchTrace domain tables, authentication behavior, or live database calls during normal application checks.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.2.8, Next.js 16.3.4, Bun 1.4.2

**Primary Dependencies**: Existing `@supabase/ssr`, `@supabase/supabase-js`, and `server-only`; add `drizzle-orm` and `postgres` for server-only PostgreSQL access, `drizzle-kit` and `dotenv` for schema tooling, and `@electric-sql/pglite` for offline migration verification.

**Storage**: Supabase-hosted PostgreSQL. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` remain browser-safe Data API configuration. A non-public `DATABASE_URL` holds the Supabase direct PostgreSQL connection string for migration tooling and the initially dormant server database boundary. PGlite is test-only and contains no product data.

**Testing**: Jest 30 with Next’s Jest integration; Node-environment unit tests for database configuration and the server-only factory; PGlite migration integration test; static boundary tests; `bun run build` bundle check. The default `bun run check` remains credential-free and offline.

**Target Platform**: Private Next.js App Router application, deployed as a Node.js-capable web service. This feature must not opt routes into an Edge runtime because the selected PostgreSQL driver is a server-only Node boundary.

**Project Type**: Single Next.js web application with server-side data tooling.

**Performance Goals**: The normal application shell performs zero database connections or queries. Local configuration validation remains synchronous and completes before a connection is opened.

**Constraints**: No database password, service-role/secret key, or connection string may be committed, logged, returned in validation errors, emitted in a browser bundle, or put in `next.config.ts`. Database migrations use a selected direct Supabase connection and must be reviewed as committed artifacts. Normal checks require neither a Supabase account nor network access.

**Scale/Scope**: One typed database boundary and an empty application-schema baseline only. The feature adds no application domain tables, user records, storage objects, auth flows, RLS policies, query repositories, or deployment-specific pooling behavior.

## Constitution Check

### Pre-design gate — PASS

| Constitution principle | Design response |
|---|---|
| Evidence Before Inference | No AI extraction, evidence decision, or source material is introduced. |
| Human Review and Control | Contributors review generated SQL and choose the named target before applying a migration; no user records are changed without an explicit later feature. |
| Privacy, Isolation, and Explicit Consent | Browser-safe Supabase configuration remains distinct from server-only PostgreSQL configuration. No secret/admin key is introduced. No user-owned table or access path is created, so RLS and cross-user tests remain explicit release gates for the feature that introduces them. |
| Bounded and Honest AI | No AI provider, prompt, model output, or automation is introduced. |
| Lean, Testable Delivery | The scope is limited to configuration, schema tooling, and offline verification. All new automated tests live under `tests/002-drizzle-supabase-setup/`; an optional manual disposable-Supabase validation is documented separately. |

No constitution violation is required. The risk that direct PostgreSQL credentials can bypass the public Data API is contained by keeping the boundary server-only and by deferring user tables and request handling until owner-scoping and RLS are designed together.

### Post-design gate — PASS

The Phase 1 artifacts preserve the pre-design decisions: there is one migration authority, zero domain tables, zero user data, an offline migration test, and no browser-reachable server credential path. The design has no unresolved clarification or constitution exception.

## Project Structure

### Documentation (this feature)

```text
specs/002-drizzle-supabase-setup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── database-boundary.md
│   └── schema-workflow.md
└── tasks.md                         # Created by $speckit-tasks
```

### Source Code (repository root)

```text
.env.example                         # Public Supabase and server-only DB placeholders, no values
drizzle.config.ts                    # Drizzle Kit schema/output configuration
drizzle/                             # Reviewed SQL migration artifacts and Drizzle metadata
lib/
├── db/
│   ├── config.ts                    # Pure server DB env validation/errors
│   ├── index.ts                     # `server-only` typed Postgres/Drizzle factory
│   └── schema.ts                    # Canonical (initially empty) application schema exports
└── supabase/                        # Existing browser/server Data API factories; extend, do not replace
scripts/
└── db/
    └── migrate.ts                   # Validates selected target then applies committed migrations
tests/
└── 002-drizzle-supabase-setup/
    ├── db/
    │   ├── config.test.ts
    │   └── server-boundary.test.ts
    ├── migrations/
    │   └── pglite-baseline.test.ts
    └── boundaries/
        └── database-static-boundary.test.ts
README.md                            # Local setup, migration workflow, and scope updates
package.json                         # Dependencies and db scripts
skills-lock.json                     # Updated by the requested project-skill installs
```

**Structure Decision**: Extend the existing root-level `lib/supabase/` convention with a separate `lib/db/` server-only module. Keep Drizzle artifacts at the repository root, where the package scripts and reviewers can find them, and isolate feature tests under the constitution-required specification identifier.

## Complexity Tracking

No constitution violations or complexity exceptions require tracking.

