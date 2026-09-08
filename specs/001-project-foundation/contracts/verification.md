# Foundation Verification Contract

## Commands

| Command | Contract |
|---|---|
| `bun run test` | One-shot Jest suite; returns nonzero on any failed assertion. |
| `bun run test:watch` | Local watch mode; not used by the complete check. |
| `bun run test:coverage` | One-shot Jest suite with V8 coverage output. |
| `bun run typecheck` | Strict TypeScript check without emitted files. |
| `bun run check` | Ordered lint + typecheck + one-shot Jest suite; requires no network or live Supabase project. |
| `bun run build` | Separate production compilation gate used after `check`; not a substitute for behavior tests. |

## Jest Runtime Contract

- `next/jest({ dir: './' })` provides framework-aware transforms and asset/style/font handling.
- Default environment is jsdom; server-only tests opt into Node where needed.
- `jest.setup.ts` installs DOM and accessibility matchers.
- Root alias `@/*` resolves consistently with `tsconfig.json`.
- Tests restore environment variables and mocks after each case and never depend on test order.

## Required Test Groups

### Shell

- The retained Efferd structure exposes an inset sidebar, accessible collapse/mobile trigger, collapsible navigation, header/current-location region, and padded main inset.
- SearchTrace title/identity, skip link, one main landmark, and honest unavailable copy are present.
- Create Next App/Vercel starter identity and every Efferd/ecommerce demo brand, route, remote avatar, user, notification, product, billing/logout, and changelog artifact are absent.
- Keyboard tab order begins with the skip link and reaches the sidebar trigger and available controls logically; opening/closing navigation preserves accessible names and state.
- Rendering with public configuration absent succeeds.
- Mocked Supabase factories and `fetch` receive zero calls during render.
- Static/source guards find no unresolved `IconPlaceholder`, numbered demo import path, `pxx-4` typo, or unnamed icon-only trigger in retained block files.

### UI foundation

- Representative Button, Input/FieldLabel, Card, Alert/status, Skeleton, and Spinner compositions expose expected roles and accessible names.
- Disabled, busy, invalid, described, loading, and error states communicate without relying only on color.
- Axe reports no detectable violations for representative shell and primitive compositions.

### Supabase configuration

- Valid HTTPS and supported local-development inputs normalize successfully.
- Missing, blank, malformed, and unsafe-protocol inputs fail before factory construction.
- Failures name variables and remediation while never echoing the supplied key or URL.

### Client factories

- Browser factory passes the exact validated URL/key to the mocked browser SDK factory once.
- Server factory awaits mocked `cookies()`, passes get/set adapters to the mocked server SDK factory, and delegates cookie operations correctly.
- Importing either module performs no SDK factory or network call.
- Client-reachable configuration/browser modules contain no secret/service-role variable reference.

## Browser-Only Verification Boundary

Jest/jsdom must not be used to claim real CSS layout, media-query appearance, horizontal overflow, visible ring styling, or 200% zoom correctness. Those requirements are verified through the repeatable manual procedure in `quickstart.md` until a later feature justifies Playwright.

## Failure Behavior

An intentionally changed product heading, removed main landmark, enabled fake workspace action, malformed config expectation, or unexpected SDK call must cause `bun run check` to return nonzero and identify the failing test name/assertion.
