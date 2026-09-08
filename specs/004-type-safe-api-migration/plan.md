# Implementation Plan: Type-Safe API Migration

**Branch**: `004-type-safe-api-migration` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-type-safe-api-migration/spec.md`

## Summary

Establish tRPC v11 as the single boundary for application-owned reads and mutations. Use an App Router Fetch endpoint, request-scoped Better Auth context, central public/protected procedures, Zod validation, redacted errors, in-process Server Component callers, and the current TanStack React Query client integration. Retain provider-owned auth, database, migration, and framework navigation boundaries as documented exceptions; remove the thin auth Server Actions in favor of the Better Auth client where regression tests prove equivalent behavior.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2.8, Next.js 16.3.4, Bun 1.4.2

**Primary Dependencies**: aligned tRPC v11 packages, TanStack React Query v5, Zod 4.1.12, SuperJSON, Better Auth 1.7.3, Drizzle ORM 0.45.2, `postgres`, `server-only`, `client-only`

**Storage**: Supabase-hosted Postgres through server-only Drizzle; no schema changes

**Testing**: Jest 30, Testing Library, direct callers, Fetch-adapter integration, static inventory/boundary checks, auth regression, and later disposable-database ownership checks

**Target Platform**: Node-compatible Next.js App Router hosting and evergreen browsers

**Project Type**: Single-repository full-stack web application

**Performance Goals**: context authenticates once per request/batch; Server Components avoid self-HTTP; a contributor adds a protected procedure within 30 minutes

**Constraints**: server-validated identity only; server-only data access; validation before effects; owner ID never trusted from input; sensitive errors/logs redacted; auth cookies/redirects cannot regress; no domain CRUD added

**Scale/Scope**: one tRPC endpoint and root router, public/protected bases, server/browser consumers, auth-form boundary migration, and a complete exception inventory

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Concern | Plan response | Status |
|---|---|---|
| Evidence/human control | Future analysis operations must preserve opt-in, review, structured output, and unchanged source records on failure. | Pass |
| Privacy/isolation | Better Auth supplies identity; repositories require context actor ID; owner predicates and RLS remain mandatory. | Pass |
| Validation | Every procedure has a Zod schema; validation, authentication, and ownership precede effects. | Pass |
| Sensitive data | Only safe code/path/request ID metadata may be exposed or logged. | Pass |
| Lean testing | No domain CRUD; tests live under `tests/004-type-safe-api-migration/`. | Pass |
| Next.js rules | Design follows repository-local Next.js 16 Route Handler, async headers, and RSC guidance. | Pass |

**Post-design review: PASS.** Contracts preserve all gates. Retained exceptions are bounded provider/framework/infrastructure concerns, not a second application API. Missing Specification 003 tests are an inherited gap covered for affected auth behavior here.

## Project Structure

### Documentation (this feature)

```text
specs/004-type-safe-api-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/application-api.md
├── contracts/migration-inventory.md
└── tasks.md # created by $speckit-tasks
```

### Source Code (repository root)

```text
app/api/trpc/[trpc]/route.ts
app/api/auth/[...all]/route.ts
app/layout.tsx
components/auth/{sign-in-form,sign-up-form,sign-out-button}.tsx
lib/{auth,auth-client}.ts
lib/auth/{session,validation}.ts
lib/db/{index,schema}.ts
trpc/{init,query-client,client,server}.ts(x)
trpc/routers/{_app,system}.ts
tests/004-type-safe-api-migration/{auth,boundaries,context,consumers,procedures,transport}/
```

**Structure Decision**: Keep one App Router app. Transport-neutral routers live in `trpc/`; one Fetch handler exposes them. Server Components execute in-process while interactive leaves use the client provider. Native auth, database, tooling, and page redirect boundaries remain per the inventory.

## Complexity Tracking

No constitution violations require justification.
