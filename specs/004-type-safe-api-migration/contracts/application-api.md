# Contract: Application API Boundary

## Boundary

- Root router exports one `AppRouter` and composes noun-named routers.
- HTTP consumers use GET/POST `/api/trpc/[procedure]`; Server Components use the same router in-process.
- Better Auth `/api/auth/[...all]` remains separate.
- Interactive leaves use inferred query/mutation options; no duplicate DTO types.

## Context and procedures

Context validates Better Auth from server headers once and exposes minimal identity plus server-only services. Client input and proxy state never establish authority. Every procedure has an explicit Zod schema and executes validation → authentication → ownership → effects. Future owner queries combine context actor ID and record ID. Foreign and nonexistent private resources are indistinguishable.

## Errors and logging

Allowed codes are `BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, and `INTERNAL_SERVER_ERROR`. Serialized errors may contain safe code/message, allowlisted field details, and request ID. Logs may contain time, path, code, request ID, duration, and approved metadata. Neither may contain raw input/output, context, causes, stack traces, cookies, sessions, credentials, emails unless required, or résumé/job-description/feedback/prompt/model content.

## Consumers and effects

Server Components remain server components and do not self-fetch the HTTP route. Interactive consumers use the provider and consistent SuperJSON hydration. Mutation completion refreshes only affected data. Multi-step writes use transactions; duplicate-sensitive operations define explicit uniqueness/idempotency behavior.

## Acceptance example

A minimal protected procedure demonstrates schema validation, anonymous denial, validated identity, safe service invocation, inferred types, safe errors, and both server and interactive consumption without adding domain persistence.

## Contributor recipe

Add a noun-named router under `trpc/routers/`, compose it in `_app.ts`, and give every procedure a Zod input schema. Use `publicProcedure` only for intentionally anonymous behavior; use `protectedProcedure` for anything private and take the actor only from `ctx.actorId`. Repositories must combine that actor with the requested record identifier and return `unavailableResource()` for both missing and foreign records. Server Components call `getTRPCCaller()`; interactive leaves use `useTRPC()` with TanStack query or mutation options. Do not import database, auth server, routers, or server callers into browser modules.

Future multi-step mutations require a database transaction and a defined idempotency or uniqueness strategy. The first owner-scoped domain release must also prove cross-user denial at both the protected-procedure and Postgres RLS boundaries.
