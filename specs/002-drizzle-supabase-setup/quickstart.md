# Quickstart: Validate Drizzle and Supabase Setup

This guide validates the planned feature without placing credentials in source control or requiring a remote backend for the default test suite. Interface details are defined in [the database boundary contract](./contracts/database-boundary.md) and [schema workflow contract](./contracts/schema-workflow.md).

## Prerequisites

- Node.js 20.9+ and Bun 1.4.2 or a compatible Bun release.
- A repository checkout with dependencies installed.
- A Supabase project only for the optional manual migration check. Use an isolated disposable project; never use an unreviewed shared target.

## 1. Install the requested project skills

Run these exact commands from the repository root and review the resulting `skills-lock.json` and skill directories before continuing:

```powershell
bunx skills add https://github.com/lobehub/lobehub --skill drizzle
bunx skills add https://github.com/supabase/agent-skills --skill supabase
```

Expected result: both skills are available to project-local tooling. If installation fails, report the tooling failure and stop; do not substitute credentials, change a backend, or skip the review.

## 2. Install dependencies and configure locally

```powershell
bun install --frozen-lockfile
Copy-Item .env.example .env.local
```

In `.env.local`, populate the public Supabase URL/publishable key only when exercising the existing Supabase factories. Populate `DATABASE_URL` only when intentionally running the manual migration check; obtain its direct PostgreSQL value from the Supabase project’s Connect panel. Leave every secret in `.env.local` and verify `git status --short` does not list it.

Expected result: `.env.example` remains credential-free and `.env.local` is ignored. Missing values do not prevent the shell or offline checks from running.

## 3. Run the offline quality and migration checks

```powershell
bun run check
bun run test -- tests/002-drizzle-supabase-setup/migrations
bun run build
```

Expected result: all commands pass without a Supabase account, credentials, or network database call. The migration test applies the initial baseline to PGlite twice and confirms the second application has no duplicate change. The build succeeds with no import of the database boundary from browser-reachable code.

## 4. Optional manual disposable-Supabase migration check

After reviewing the initial schema artifact and confirming that `DATABASE_URL` targets a disposable project:

```powershell
bun run db:migrate
bun run db:migrate
```

Expected result: the first run creates/records the baseline; the second reports no pending changes or otherwise succeeds without duplicating schema objects. An invalid or missing URL fails with remediation guidance that names `DATABASE_URL` but never prints its value.

Do not run this step against a shared environment until a reviewer has verified the target, schema artifact, and resulting SQL. This feature creates no user tables and does not validate Supabase Auth, RLS, private storage, or cross-user access.

## 5. Credential-exposure regression check

Set a unique temporary `DATABASE_URL` only in the current shell, run the production build, and search browser-delivered static output for that sentinel. Then close the shell or remove the temporary process variable.

Expected result: the sentinel has zero matches in `.next/static`; normal error output also contains no candidate URLs, passwords, or publishable-key values beyond variable names.

