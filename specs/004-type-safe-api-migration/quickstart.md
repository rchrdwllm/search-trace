# Quickstart: Validate the Type-Safe API Migration

## Prerequisites

Install reviewed aligned tRPC v11 packages, React Query v5, SuperJSON, and `client-only` with Bun; commit the lockfile. Use disposable Better Auth/Postgres configuration only. Review the [API contract](./contracts/application-api.md) and [inventory](./contracts/migration-inventory.md).

## Automated validation

```shell
bun run lint
bun run typecheck
bun run test -- tests/004-type-safe-api-migration
bun run test
bun run build
```

Expected: context rejects absent/expired/forged sessions; validation precedes services; safe errors/logs are redacted; GET/POST `/api/trpc` forwards headers; server/browser consumers share inferred types; recursive inventory finds no unclassified boundary; auth registration/sign-in/sign-out, safe return path, failures, expiry, and redirects retain behavior. The reviewed lockfile must contain tRPC v11, React Query v5, SuperJSON, and `client-only`.

## Manual validation

1. Call a public foundation procedure anonymously; no session/infrastructure detail is returned.
2. Call the protected example anonymously, with forged/expired state, and valid state; only the valid session succeeds.
3. Exercise sign-up, sign-in, sign-out, invalid credentials, and browser Back. Confirm Better Auth cookies and redirects remain correct.
4. Confirm `/dashboard` page authorization remains authoritative without relying on tRPC or proxy alone.
5. Trigger malformed/internal failures and inspect responses/logs for zero raw inputs, sessions, credentials, stack traces, or provider/database details.
6. Inspect browser imports/bundle for zero `lib/db`, `lib/auth`, Drizzle/Postgres, server router implementation, database URL, or secrets.

## Deferred ownership gate

The first owner-scoped domain feature must add disposable-database tests for owner success and cross-user read/update/delete/relate denial at both protected-procedure and RLS boundaries. Foreign and nonexistent IDs must be indistinguishable.

## Release evidence

Record dependency/lockfile review, checks, inventory result, representative procedure outcomes, and auth regression results. Never record passwords, full emails, cookies, tokens, database URLs, or private source content.
