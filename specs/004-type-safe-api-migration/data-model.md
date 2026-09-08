# Data Model: Type-Safe API Migration

No persistent tables or migrations are added.

## Application Operation

- `path`: unique router-qualified name
- `kind`: `query` or `mutation`
- `access`: `public` or `protected`
- `inputContract`: explicit Zod schema, including empty input
- `outputContract`: inferred, serializable, non-sensitive result
- `failureSet`: approved safe error codes

## Request Context

- `headers`: server-owned incoming headers
- `session` and `user`: Better Auth-validated, nullable until protected middleware
- `services`: server-only capabilities, never serialized
- `requestId`: non-authoritative diagnostic correlation value

Transition: anonymous context is rejected by protected middleware; authenticated context narrows to non-null identity.

## Validation and authorization flow

Raw input → Zod validation → session validation → ownership/relationship checks → behavior. Any failure before behavior leaves state unchanged. Future repositories accept context-derived `actorId`; input `userId` never grants authority.

## Safe Failure

| Code | Recovery |
|---|---|
| `BAD_REQUEST` | Correct allowlisted fields |
| `UNAUTHORIZED` | Sign in |
| `NOT_FOUND` | Return to owned resources without existence disclosure |
| `CONFLICT` | Refresh or revise action |
| `TOO_MANY_REQUESTS` | Retry when permitted |
| `INTERNAL_SERVER_ERROR` | Retry without internal detail |

## Migration Inventory Item

Each item records `location`, `classification` (`migrate`, `retain`, `remove`), boundary `owner`, rationale, verification, and an expiry/review condition for temporary exceptions. See [migration-inventory.md](./contracts/migration-inventory.md).
