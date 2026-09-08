# UI Contract: Authentication Journeys

## Routes

| Route | Audience | Required behavior |
|---|---|---|
| `/` | All visitors | Resolve to the authenticated dashboard or the sign-in entry; do not render the existing public foundation shell. |
| `/sign-in` | Unauthenticated visitors | Email/password form, sign-up link, accessible inline validation, generic failed-sign-in guidance, and an optional sanitized `next` path. |
| `/sign-up` | Unauthenticated visitors | Email and password form. Successful submission establishes a session and directs the user to the sanitized private destination or `/dashboard`; any provider-required non-profile account label is supplied server-side. |
| `/dashboard` | Authenticated users only | Performs an authoritative session check before rendering. Shows a visible sign-out control. |

## Form and action rules

- Validate email, password, and return path on the server with Zod before invoking Better Auth.
- All mutations use POST semantics through Better Auth’s mounted handler or server actions; client-side validation is enhancement only.
- Forms disable repeated submissions while pending and announce completion/errors accessibly.
- Sign-in and registration errors are generic and never expose secret values or account state beyond the current user-initiated flow.
- `next` accepts only a same-origin relative private path. Reject an empty, malformed, absolute, protocol-relative, or external value and use `/dashboard` instead.

## Session contract

- `requireSession()` reads request headers server-side and returns only the minimum authenticated user/session fields needed by the caller or redirects to `/sign-in` with a sanitized return path.
- Every protected page, server action, and route handler calls it; proxy cannot be the sole security control.
- Sign-out invalidates the active Better Auth session and returns the browser to `/sign-in`. Browser back/direct navigation must invoke the protected route check again.
