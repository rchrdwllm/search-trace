# Data Model: User Authentication

## Storage boundary

Better Auth owns these tables in the `public` schema of the Supabase-hosted Postgres database. The migration revokes `anon` and `authenticated` table privileges so the tables are not exposed through Supabase’s browser Data API; they are accessed only by the server-side Better Auth/Drizzle adapter. The generated Drizzle declarations and resulting migration are the source of truth; this document is a design contract, not a hand-written replacement for generated schema.

## Entities

### User

| Field | Rules | Purpose |
|---|---|---|
| `id` | Stable, provider-generated identifier | The sole identity value future application records may reference after the ownership/RLS amendment is approved. |
| `email` | Required, normalized, unique | Sign-in identifier. |
| `name` | Required by Better Auth email/password sign-up; supplied server-side as a non-profile placeholder | Provider-required account field; do not collect profile data in this feature. |
| `createdAt`, `updatedAt` | Required timestamps | Lifecycle metadata. |

### Account

| Field | Rules | Purpose |
|---|---|---|
| `id` | Stable identifier | Account record identifier. |
| `userId` | Required reference to User | Associates an email/password credential with one user. |
| `providerId`, `accountId` | Required provider identifiers | Identifies the Better Auth credential provider. |
| `password` | Server-managed, never returned to UI/logs | Password credential material managed by Better Auth. |

### Session

| Field | Rules | Purpose |
|---|---|---|
| `id` | Stable identifier | Session record identifier. |
| `userId` | Required reference to User | Authenticated account identity. |
| `token` | Required, unique, secret | Cookie-backed session proof; never render or log. |
| `expiresAt` | Required future timestamp | Validity boundary. |
| `ipAddress`, `userAgent` | Optional provider-managed metadata | Session context; do not display or use for authorization in this MVP. |

## State transitions

```text
unregistered → registered account + authenticated session
                                  │
                                  └─ sign out/expiry → registered account
```

- A successful registration creates a registered account and authenticated session in the same flow.
- Sign-out invalidates the active session. A private request with an absent, expired, or invalid session redirects before rendering protected content.

## Relationships and deferred ownership

- One User has many Accounts and Sessions.
- Email verification is intentionally deferred. If a provider-generated verification table is present in generated schema output, it remains unused by this feature.
- Future SearchTrace domain rows must reference `User.id`, but their row-level-security identity propagation is **deferred and blocked on the constitution amendment**. This feature creates no `profiles`, opportunities, résumés, evidence, or feedback rows.
