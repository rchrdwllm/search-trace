# Implementation Plan: User Authentication

**Branch**: `003-user-authentication` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-user-authentication/spec.md`, with the user-selected clarification that Better Auth owns authentication and Supabase stores application data.

## Summary

Deliver email/password registration with an immediate authenticated session, sign-in, session-aware private routes, and sign-out. Better Auth will own credentials and sessions; it will persist its required server-only tables through the existing Drizzle connection to Supabase-hosted Postgres. Next.js 16 server components/actions will make authoritative session checks, with a root `proxy.ts` providing only a fast redirect prefilter for `/dashboard` and future private routes. The first private route composes the existing Project Foundation `AppShell` in a nested dashboard layout, while the public root redirects to the authentication entry. Supabase remains the private Postgres and future application-data platform, not the authentication API.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5, React 19.2.8, Next.js 16.3.4, Bun 1.4.2

**Primary Dependencies**: Better Auth (pin a reviewed 1.7.x release), Drizzle ORM 0.45.2, `postgres` 3.4.9, Zod (add as required by the constitution), shadcn/ui, existing Jest 30 and Testing Library

**Storage**: Supabase-hosted Postgres. Better Auth core records live in the `public` schema because the project will use the canonical application schema; their Data API privileges are revoked and they are accessed only by the server-side database role. Future SearchTrace domain records also remain in `public` with row-level security.

**Testing**: Jest 30 + Testing Library; provider/database interactions mocked for unit and component tests; a disposable Postgres/Supabase environment for migration and end-to-end authorization checks.

**Target Platform**: Private Next.js web application on Node.js-compatible serverless hosting, current evergreen browsers.

**Project Type**: Full-stack Next.js App Router web application.

**Performance Goals**: Meet SC-001’s registration-to-dashboard journey in two minutes or less for 95% of prepared-fixture runs; do not add database work to the route prefilter.

**Constraints**: A successful registration issues an authenticated session immediately; email verification is deferred. Credentials, Better Auth secrets, database URLs, tokens, and account existence must never be exposed in browser bundles or normal errors. Redirect destinations and trusted origins must be allowlisted. Each authoritative page, route handler, and server action validates the session itself.

**Scale/Scope**: One public sign-in entry, registration with immediate access, `/dashboard` as the first private route, Better Auth’s catch-all API route, and an auth-specific test directory. Email verification, social sign-in, password reset, teams, administration, and all product-domain records are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS — governance amendment approved and recorded before implementation.**

| Constitutional concern | Plan response | Gate status |
|---|---|---|
| Better Auth replaces the previous Supabase Auth assumption, and email verification is deferred. | Better Auth replaces only the identity/session provider, and the approved amendment records server-controlled Better Auth identity propagation to future Supabase RLS policies. Supabase remains the hosted Postgres platform. | Pass |
| Privacy and isolation | Keep Better Auth tables in `public` as requested, but revoke `anon`/`authenticated` table privileges and access them only through the server-side database role. Do not use browser-accessible Supabase database credentials. | Pass for this feature’s auth tables; later public tables still require RLS and owner checks. |
| Server validation and authentication | Validate inputs on server boundaries; authenticate every server action, route handler, and private page from request headers. Proxy is only an optimistic redirect aid. | Pass |
| Lean, testable delivery | Keep the scope to email/password, immediate sessions, and one dashboard; test failure and authorization behavior under `tests/003-user-authentication/`. | Pass |

**Post-design review: pass.** The approved amendment preserves the constitution’s RLS requirement. This feature does not create domain data tables or weaken ownership checks; future app-data RLS must consume a server-verified Better Auth identity.

## Project Structure

### Documentation (this feature)

```text
specs/003-user-authentication/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── (auth)/
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
├── api/auth/[...all]/route.ts
├── dashboard/
│   ├── layout.tsx          # Shared Project Foundation AppShell for private workspace routes
│   └── page.tsx
└── page.tsx

components/auth/
├── auth-form.tsx
├── sign-out-button.tsx

lib/
├── auth.ts
├── auth-client.ts
├── auth/session.ts
├── auth/validation.ts
├── db/index.ts
└── db/schema.ts

proxy.ts

tests/003-user-authentication/
├── auth/
├── routes/
├── components/
└── migrations/
```

**Structure Decision**: Use the existing single-project App Router layout. Keep Better Auth configuration and authoritative session access in server-only `lib/auth*` modules; use a small browser client only for interactive form/session UI. The provider-owned catch-all handler is isolated under `app/api/auth/[...all]`. Preserve the Project Foundation `AppShell` at the private workspace boundary through `app/dashboard/layout.tsx`; pages beneath it provide only route content, so the shell continues to own the primary landmark. Do not create a separate backend service.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Replacing the constitution’s named authentication provider | The user explicitly selected Better Auth for credentials and sessions. | Continuing with Supabase Auth would contradict the approved architecture amendment. |
