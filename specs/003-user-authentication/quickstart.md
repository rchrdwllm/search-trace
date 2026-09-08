# Quickstart: Validate User Authentication

## Prerequisites

1. Approve and record the constitution/PRD amendment replacing Supabase Auth and defining the future Better Auth identity-to-RLS boundary.
2. Install the Better Auth best-practices skill requested for this project:

   ```shell
   bunx skills add https://github.com/better-auth/skills --skill better-auth-best-practices
   ```

3. Configure a disposable Supabase-hosted Postgres database, private Better Auth secrets, and an approved local application origin. Do not use production credentials.
4. Install reviewed, pinned Better Auth and validation dependencies; commit the Bun lockfile. Generate the Better Auth Drizzle declarations, review them, then create and apply the Drizzle migration through the existing migration workflow.

## Automated validation

Run the project checks after adding tests under `tests/003-user-authentication/`:

```shell
bun run lint
bun run typecheck
bun run test
```

Expected: registration validation and immediate-session behavior, generic failed sign-in, safe-return-path handling, protected-route behavior, sign-out, expired session, and provider failure tests pass. Static checks confirm secrets cannot reach browser code.

## End-to-end checks

1. Start the application with disposable configuration and open `/dashboard` in a fresh browser session. It must redirect to `/sign-in` before any dashboard content appears.
2. Register a new account with the prepared fixture. Confirm the account receives an authenticated session and reaches `/dashboard` without an email-verification step.
3. Sign in with valid credentials and confirm `/dashboard` renders inside the SearchTrace shell: product identity, primary navigation, skip link, and exactly one `main` landmark are present. Repeat with wrong credentials; no account-existence detail or private content may appear.
4. Sign out, then use browser Back and direct navigation to `/dashboard`. Both checks must require a fresh sign-in.
5. Repeat the private-route check with an expired or forged session cookie. Proxy may redirect early, but the server-side page/session helper must deny access in all cases.

## Release evidence

Record the approved origin/base-URL configuration, migration review, constitution/PRD amendment, automated test output, and an observed registration/sign-in/sign-out journey. Do not record passwords, full email addresses, secrets, cookies, or session tokens.

## Implementation record

- Governance amendment approved and recorded in the PRD and constitution.
- Better Auth 1.7.3 and Zod 4.1.12 installed; Better Auth best-practices skill installed locally.
- TypeScript and ESLint checks pass. End-to-end execution requires disposable `DATABASE_URL`,
  `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` values.
