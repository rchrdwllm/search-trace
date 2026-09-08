# Contract: Initial Migration Inventory

| Location | Decision | Rationale |
|---|---|---|
| `app/(auth)/actions.ts` and three auth form consumers | Migrated: forms use `lib/auth-client.ts`; Server Action module removed | Better Auth owns cookies and its protocol; tRPC is deliberately not an auth wrapper. Client forms preserve validation, safe navigation, and generic errors. |
| `app/api/auth/[...all]/route.ts` | Retain | Better Auth-owned endpoint/protocol. |
| `lib/auth/session.ts`, `app/page.tsx`, `app/dashboard/page.tsx`, `proxy.ts` | Retain | Server/page authorization and framework navigation; proxy stays non-authoritative. |
| `lib/auth.ts`, `lib/db/index.ts` | Retain | Server-only provider adapter and infrastructure, not application operations. |
| `scripts/db/migrate.ts` | Retain | Offline schema tooling. |
| `lib/supabase/server.ts`, `lib/supabase/client.ts` | Retain with boundary tests | Platform factories; browser client must not become direct application database access. |

A recursive static test inventories every `"use server"`, Route Handler, Server Component DB import, browser server-module import, and direct application Supabase query. Every occurrence must use tRPC or appear here with owner, rationale, verification, and expiry if temporary.
