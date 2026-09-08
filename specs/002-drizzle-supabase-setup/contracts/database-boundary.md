# Database Boundary Contract

## Purpose

Define the server-only interface that later repository functions may use. This feature creates the boundary and validates it; it does not expose query functions or execute product-data operations.

## Configuration Interface

```ts
type DatabaseConfig = Readonly<{
  connectionString: string
}>

class DatabaseConfigurationError extends Error {}

function validateDatabaseConfig(candidate: {
  databaseUrl?: string
}): DatabaseConfig

function getDatabaseConfig(): DatabaseConfig
```

### Required behavior

- `getDatabaseConfig()` reads the literal non-public `process.env.DATABASE_URL` only when a server database operation or migration runner requests it.
- Blank, missing, malformed, or non-PostgreSQL candidate values throw `DatabaseConfigurationError` before a client is constructed.
- Errors name `DATABASE_URL` and point to `.env.example`/the setup documentation, but never include any candidate value, password, hostname, or full URL.
- This module is not browser-reachable and does not call `process.env` through a dynamic key lookup.

## Server-only Factory Interface

```ts
function createDatabaseClient(): {
  db: /* typed Drizzle database bound to lib/db/schema */
  close: () => Promise<void>
}
```

### Required behavior

- `lib/db/index.ts` imports `server-only` before runtime database code.
- The factory validates configuration, creates a `postgres` driver, creates a Drizzle client typed from `lib/db/schema.ts`, and returns a close operation for short-lived scripts/tests.
- Importing the module does not validate configuration, create a connection, run a query, or make a network request.
- A client component, page, layout, or public Supabase factory must not import the database factory. Static and build checks enforce this boundary.
- The factory must not use a Supabase secret/service-role key. Direct database credentials are server-only and are not an authorization substitute; a later user-data feature must authenticate and scope every query separately.

## Environment Reference

| Variable | Browser-visible | Committed value | Use in this feature |
|---|---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Blank placeholder only | Existing Supabase Data API factories |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Blank placeholder only | Existing Supabase Data API factories |
| `DATABASE_URL` | No | Blank placeholder only | Direct PostgreSQL migration target and dormant server-only DB factory |

