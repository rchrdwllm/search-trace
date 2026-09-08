# Authentication

SearchTrace uses Better Auth 1.7.3 for email/password credentials and sessions. Supabase remains
the Postgres host and application-data platform; Better Auth records are stored in `public` and
accessed only through the server-side Drizzle connection. The migration enables RLS and revokes
`anon`/`authenticated` table privileges so these credential and session tables are not exposed
through the browser Data API.

Required server-only environment values:

- `BETTER_AUTH_SECRET` — at least 32 random characters.
- `BETTER_AUTH_URL` — the canonical application origin.
- `DATABASE_URL` — the private Postgres connection used by Drizzle.

Registration creates a session immediately. Email verification is intentionally deferred. The
authoritative session check is `requireSession()` in `lib/auth/session.ts`; `proxy.ts` only performs
a cookie-presence prefilter and is not an authorization boundary.

Apply `drizzle/0001_better_auth.sql` through the normal migration workflow. Never expose the
database URL, Better Auth secret, session token, or password material to browser code or logs.
