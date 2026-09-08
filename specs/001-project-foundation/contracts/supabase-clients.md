# Supabase Client Boundary Contract

## Public Configuration API

```ts
type PublicSupabaseConfig = Readonly<{
  url: string
  publishableKey: string
}>

function validatePublicSupabaseConfig(candidate: {
  url?: string
  publishableKey?: string
}): PublicSupabaseConfig

function getPublicSupabaseConfig(): PublicSupabaseConfig
```

`getPublicSupabaseConfig()` must use direct literal reads of `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then delegate to the pure validator. Dynamic environment-property lookup is forbidden because Next.js does not inline it for browser code.

## Browser Factory API

```ts
function createBrowserSupabaseClient(): SupabaseClient
```

- Module is client-only.
- Factory validates configuration at call time and then delegates to `createBrowserClient`.
- Importing the module performs no validation, construction, fetch, auth, data, or storage operation.
- No eager shared singleton is required by this feature.

## Server Factory API

```ts
async function createServerSupabaseClient(): Promise<SupabaseClient>
```

- Module imports `server-only` before other runtime behavior.
- Factory validates the same public configuration, awaits Next.js `cookies()`, and delegates to `createServerClient` with `getAll`/`setAll` cookie adapters.
- Callers must understand that cookie writes belong in a supported server mutation context. This feature has no caller.
- The server factory uses the publishable key, not an admin/secret key.

## Environment Contract

| Variable | Browser-visible | Required when | Secret |
|---|---:|---|---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Either factory is requested | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Either factory is requested | No |

No secret or legacy service-role variable is introduced or required. `.env.example` contains empty assignments and guidance. `.env.local` remains ignored.

## Error Contract

Missing, blank, malformed, or unsafe-protocol configuration throws `SupabaseConfigurationError` before client construction. The message:

- names affected environment variables;
- points to `.env.example` or setup documentation;
- never includes the supplied URL, key, cookie, or any other credential value;
- aggregates missing variables where possible.

## Network and Security Contract

- Creating an SDK client object is not itself a product-data operation; no `.auth`, `.from`, `.storage`, `.functions`, or equivalent operation is called in this feature.
- Shell/layout/page modules do not import these factories.
- Client-reachable modules contain no reference to `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
- A future secret/admin client requires its own approved requirement, server-only module, authorization checks, and tests. It may not reuse or extend the browser-safe config object.
- A publishable key is not an authorization boundary. Later data access must add grants, row-level security, ownership enforcement, and cross-user denial tests before browser queries are allowed.

## Deferred Authentication Contract

No Proxy or middleware is added now. Before authentication or protected routes are implemented, planning must re-check current `@supabase/ssr` guidance, add scoped cookie refresh behavior, use the current verified-identity method, and test expired/missing/cross-user sessions. The foundation server factory alone must not be described as completed authentication.
