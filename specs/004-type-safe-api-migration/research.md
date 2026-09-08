# Research: Type-Safe API Migration

## Decisions

### Current tRPC integration

**Decision**: Use aligned tRPC v11 server/client/TanStack packages with React Query v5, not the classic adapter.

**Rationale**: It is the current official App Router path and provides inferred contracts, caching, invalidation, hydration, and prefetching.

**Alternatives considered**: Vanilla client lacks managed cache; classic integration is legacy; Server Actions contradict the requested primary boundary.

### Transport and consumers

**Decision**: Expose GET/POST `/api/trpc` with `fetchRequestHandler`. Server Components call the router in-process through a server-only proxy; interactive leaves use a stable QueryClient, provider, and `httpBatchLink`.

**Rationale**: Next.js 16 Route Handlers match Web APIs. Server-to-self HTTP adds latency and fails in build-time contexts; leaf providers preserve Server Components and small bundles.

**Alternatives considered**: Pages Router, duplicate REST routes, client-only data fetching, and direct page/database calls.

### Authentication and authorization

**Decision**: Context accepts server-owned headers, calls Better Auth once per request/batch, and exposes minimal validated identity plus server services. Protected middleware narrows identity or throws `UNAUTHORIZED`. Future repositories require the context actor ID and combine it with record ownership; foreign and missing private IDs both map to `NOT_FOUND`.

**Rationale**: It prevents spoofed identity, redundant session work, and record enumeration while keeping RLS as defense in depth.

**Alternatives considered**: Caller user IDs, proxy cookie presence, and per-procedure session parsing are unsafe or redundant.

### Serialization, errors, and logs

**Decision**: Use SuperJSON consistently. Standardize `BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, and `INTERNAL_SERVER_ERROR`; expose only allowlisted field errors and log safe category/path/request ID metadata.

**Rationale**: Drizzle dates retain fidelity while raw inputs, sessions, causes, and private content remain protected.

**Alternatives considered**: Manual ISO conversion is repetitive; raw errors violate the constitution; one generic error blocks useful recovery.

### Authentication migration

**Decision**: Keep Better Auth's catch-all endpoint. Replace thin auth Server Actions with `lib/auth-client.ts` where regression tests prove cookie, redirect, pending, safe-return, and error parity; otherwise record the specific action as an integration exception. Remove the existing raw `console.log({ e })`.

**Rationale**: Better Auth owns credential/session protocol. A tRPC wrapper creates a redundant auth API and risks cookie propagation.

**Alternatives considered**: Blindly wrapping or retaining every action.

### Test scope

**Decision**: Verify context, middleware, validation, transport, both consumers, redaction, auth regression, and recursive inventory with a minimal non-domain procedure. Defer real owner-record/RLS tests until the first domain table.

**Rationale**: Proves the foundation without inventing opportunity CRUD. Specification 003's planned tests are currently absent, so affected regression coverage belongs here.

## Sources

- Repository-local Next.js 16.3.4 docs under `node_modules/next/dist/docs/`
- [tRPC App Router/RSC guide](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [Fetch adapter](https://trpc.io/docs/server/adapters/fetch), [context](https://trpc.io/docs/server/context), and [authorization](https://trpc.io/docs/server/authorization)
- `docs/prd/prd.md`, constitution, implementation, and tests inspected 2026-09-08
