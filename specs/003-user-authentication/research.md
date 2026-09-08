# Research: User Authentication

## Decisions

### Better Auth owns identity and sessions

**Decision**: Use Better Auth for email/password credentials and session lifecycle; use Supabase-hosted Postgres only as the database platform.

**Rationale**: The user explicitly selected Better Auth. Its [Next.js integration](https://better-auth.com/docs/integrations/next) supports Next.js 16, and its [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle) supports the project’s existing Postgres/Drizzle data layer.

**Alternatives considered**: Supabase Auth conflicts with the explicit user decision. A second authentication database would add credentials, operational work, and a cross-database identity boundary without a stated need.

### Keep Better Auth records private and separate

**Decision**: Generate Better Auth’s required `user`, `session`, and `account` records through the Drizzle adapter, review the generated schema, and apply them through the repository’s Drizzle migration workflow into the `public` schema. The migration revokes browser-facing `anon` and `authenticated` privileges because these tables contain password hashes and session/provider secrets.

**Rationale**: Better Auth requires persistent identity/session records. Public-schema placement is compatible with the project’s canonical schema and migration workflow, but requires explicit Data API privilege revocation; the server-side Better Auth adapter remains the only intended accessor.

**Alternatives considered**: A separate custom schema avoids public-schema exposure but adds an additional schema boundary; the project owner selected `public` with explicit privilege revocation. Using Better Auth’s direct migration command would bypass the project’s canonical Drizzle migration process.

### Defer email verification

**Decision**: Enable email/password sign-up with automatic session creation. Do not configure verification delivery, verification UI, or a verified-email requirement in this feature. Keep duplicate-sign-up and failed-sign-in presentation generic.

**Rationale**: This implements the user’s explicit deferral decision while retaining Better Auth’s standard email/password flow. Better Auth documents email/password auto-sign-in and its optional verification gate in its [email/password reference](https://better-auth.com/docs/authentication/email-password).

**Alternatives considered**: Requiring verification before issuing a session is deliberately deferred by the user. A custom credential or token implementation would duplicate provider capabilities and expand security risk.

### Authoritative checks are close to protected work

**Decision**: Add an authoritative `requireSession` server helper that calls Better Auth using the request headers. Call it in every private page, server action, route handler, and later data-access operation. A root `proxy.ts` may perform only a narrow, cookie-presence redirect for `/dashboard` and future private paths.

**Rationale**: Better Auth warns that cookie-only proxy checks are not secure; both its [Next.js guidance](https://better-auth.com/docs/integrations/next) and the installed Next.js authentication guide require server-side checks near protected data. In Next.js 16 the correct convention is `proxy.ts`, not `middleware.ts` (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`).

**Alternatives considered**: Relying on proxy alone accepts forged cookies. An auth check only in a layout is unsafe under partial rendering and does not protect server actions or route handlers.

### Restrict origins and return paths

**Decision**: Configure Better Auth with an explicit production base URL, trusted-origin allowlist, and server-only secret. Validate every `next`/callback path as a same-application relative path before preserving it or redirecting to it.

**Rationale**: Better Auth [documents](https://better-auth.com/docs/reference/options) that explicit base URLs and trusted origins prevent host-header, CSRF, and open-redirect risks. This fulfils FR-013.

**Alternatives considered**: Inferring the base URL from arbitrary requests or accepting absolute callback URLs risks open redirects and unstable deployments.

### Preserve the constitution’s future ownership boundary

**Decision**: The approved constitution/PRD amendment replaces Supabase Auth, records that email verification is deferred, and specifies server-controlled propagation of a verified Better Auth user identity into future Postgres RLS policies. The authentication feature itself will not create domain data tables or relax RLS.

**Rationale**: Better Auth sessions do not automatically populate Supabase’s `auth.uid()` context. Future RLS integration must use a server-controlled identity bridge; treating an application-supplied user ID as equivalent would weaken the stated security model.

**Alternatives considered**: Skipping RLS or trusting client-supplied owner IDs is rejected by the constitution and PRD.

## Required development guidance

Before implementation, install the user-requested Better Auth best-practices skill:

```shell
bunx skills add https://github.com/better-auth/skills --skill better-auth-best-practices
```

Pin newly added package versions and commit Bun’s lockfile. Verify current Better Auth documentation again immediately before implementation because the project’s authentication dependencies change quickly.
