# Service Contract: Better Auth Mount

## Mount

Mount Better Auth’s Next.js handler at `app/api/auth/[...all]/route.ts`. The provider owns the concrete GET and POST endpoint paths and responses below this base path; application code must use the supported server/client interfaces rather than reimplementing credential, token, or session endpoints.

## Configuration contract

- Server-only: Better Auth secret, canonical base URL, approved trusted origins, and database URL.
- Browser-safe: only the application origin/public configuration required by the Better Auth client; never pass database URLs, auth secret, or raw session records.
- Verify that the configured production base URL and trusted origins match the deployment hostnames before release. Preview hosts require explicit, reviewable allowlisting.

## Required capabilities

| Capability | Contracted outcome |
|---|---|
| Email/password registration | Creates an account and issues a session immediately, returning only to a validated in-application path. |
| Email/password sign-in | Issues a session only for valid credentials; failures do not reveal account existence. |
| Session lookup | Server-only helper validates a current request’s session before private rendering or mutation. |
| Sign-out | Ends the current session before redirecting to sign-in. |

## Error mapping

Application UI maps provider errors to stable user-safe categories: invalid form input, unavailable authentication service, and unexpected retryable failure. Logs record an opaque error category/correlation identifier only; no password, token, full email, or session value.
