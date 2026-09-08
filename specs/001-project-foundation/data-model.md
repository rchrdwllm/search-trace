# Phase 1 Data Model: Project Foundation

## Persistence Decision

This feature introduces no persisted domain entity, database migration, storage bucket, browser storage, cookie-owned session state, or generated database type. User profiles, opportunities, résumés, evidence, feedback, requirements, and authentication sessions remain outside this feature.

The models below are transient contracts used to keep configuration and presentation behavior explicit and testable.

## PublicSupabaseConfig

A validated, immutable value object passed to either lazy Supabase client factory.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `url` | string | Yes | Trimmed absolute URL. HTTPS is accepted. HTTP is accepted only for `localhost`, `127.0.0.1`, or `[::1]` local development. The value is never printed in an error. |
| `publishableKey` | string | Yes | Trimmed and nonblank. It is intentionally browser-visible but is never printed in an error. Key-prefix validation is avoided so current and legacy project keys can be migrated without changing this foundation. |

**Source mapping**:

- `url` ← direct read of `NEXT_PUBLIC_SUPABASE_URL`
- `publishableKey` ← direct read of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Lifecycle**:

```text
Not read
  └─ factory requested → candidate captured
       ├─ validation passes → Valid configuration → client constructed locally
       └─ validation fails → SupabaseConfigurationError → no client constructed
```

Importing a module or rendering the shell does not enter this lifecycle.

## SupabaseConfigurationError

A safe developer-facing error for missing or malformed public configuration.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `name` | literal string | Yes | Stable error class name. |
| `variables` | array of variable-name strings | Yes | Contains only recognized configuration names; never values. |
| `message` | string | Yes | Explains what to configure and how to consult `.env.example`; never interpolates a supplied URL or key. |

Errors aggregate all missing variables in one result. Malformed URL/protocol errors identify the variable name and accepted category, not the rejected value.

## FoundationStatus

A transient presentation model for honest placeholder, progress, and error communication.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `kind` | `info` \| `success` \| `warning` \| `error` \| `loading` | Yes | Controls semantic treatment, not product workflow state. |
| `title` | string | Yes | Concise visible label. |
| `description` | string | Yes | Explains current availability or remediation in plain text. |
| `live` | `off` \| `polite` \| `assertive` | Yes | `polite` for changing progress/status, `assertive` only for newly introduced errors, otherwise `off`. |

**State rules**:

- An unavailable future workflow is `info` or `warning`, never `success` or an active link.
- Loading uses visible text plus decorative skeleton/spinner output.
- Static initial errors do not require an assertive announcement; dynamically introduced errors do.
- User-authored content is not part of this foundation model.

## ShellNavigationItem

A transient description of an item shown in the shell navigation region.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `label` | string | Yes | Unique, human-readable accessible name. |
| `state` | `available` \| `unavailable` | Yes | Foundation uses `unavailable` for deferred workspace/account destinations. |
| `href` | string | Conditional | Required only for an available item; unavailable items are not rendered as broken links. |
| `explanation` | string | Conditional | Required for unavailable items and visible near the control. |

**Allowed transition**: `unavailable → available` only when a later approved feature supplies a real destination and behavior. This feature performs no transition.

## Relationships

- Both Supabase factories consume `PublicSupabaseConfig` and either return a locally constructed client object or throw `SupabaseConfigurationError` before any remote operation.
- `AppShell` presents zero or more `ShellNavigationItem` values and may compose `FoundationStatus` for honest availability feedback.
- No transient model references a user identity, record owner, résumé, job description, AI provider, or persisted identifier.
