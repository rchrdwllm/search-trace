# Phase 0 Research: Project Foundation

**Date**: 2026-09-08

All planning unknowns are resolved. Research used the installed Next.js 16.3.4 documentation and current official ShadCN and Supabase guidance.

## Existing Application Baseline

**Decision**: Extend the current root-level App Router application rather than scaffold or relocate it.

**Rationale**: The repository already has Next.js 16.3.4, React 19.2.8, strict TypeScript, Tailwind CSS 4, Bun 1.4.2, the `@/*` root alias, global styles, and synchronous root layout/home page. Next.js permits shared root-level `components/` and `lib/` folders outside `app/`; this matches the component generator's aliases and avoids churn.

**Alternatives considered**:

- Create a new application: rejected because it duplicates and risks overwriting the valid existing setup.
- Move everything under `src/`: rejected because it provides no foundation value and expands the diff.
- Put all shared modules inside `app/`: valid, but root-level folders align better with generated component defaults and keep routing concerns distinct.

**Sources**: Repository `package.json`, `tsconfig.json`, `app/`, and installed `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`.

## ShadCN and Efferd App Shell Installation

**Decision**: Install the user-selected `@efferd/app-shell-4` namespaced registry block into the existing project. Initialize ShadCN with the `radix-nova` preset, neutral CSS-variable theme, Lucide icons, RSC/TypeScript output, root aliases, Tailwind v4, and pointer cursors. Add `button`, `input`, `field`, `card`, `alert`, `skeleton`, and `spinner` only when they are not already installed through the block's dependencies.

**Rationale**: Efferd describes `app-shell-4` as a free inset-sidebar layout with collapsible navigation and a padded main shell, directly satisfying the requested structural foundation. Current registry inspection shows that both Base and Radix payloads exist, but the Base payload is only partially converted: it still contains multiple Radix-style `asChild` compositions that do not match current Base UI APIs. The Radix payload is internally consistent and avoids a broad manual conversion before product work starts.

The ShadCN agent skill command in the supplied prompt is valid and recommended by current ShadCN guidance, but it affects agent context rather than runtime behavior. It should run only when the project-level skill is missing, and any `.agents` or instruction-file changes must be reviewed separately.

**Executable setup**:

```powershell
bunx skills add shadcn/ui
bunx --bun shadcn@latest init --preset radix-nova --pointer
```

The skill command is conditional. The init command is conditional on `components.json` being absent. The generated file must retain `app/globals.css`, `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, and `@/hooks`; the Tailwind config path remains blank for v4.

The prompt's Markdown-wrapped registry value is preserved verbatim in `plan.md`, but valid executable JSON requires the raw URL:

```json
{
  "registries": {
    "@efferd": "https://efferd.com/r/{style}/{name}.json"
  }
}
```

Then inspect and install the item:

```powershell
bunx --bun shadcn@latest view @efferd/app-shell-4
bunx --bun shadcn@latest add @efferd/app-shell-4
bunx --bun shadcn@latest info
```

**Registry declaration inspected on 2026-09-08**:

- Item type: `registry:block`; no direct npm dependencies.
- Registry dependencies: `avatar`, `breadcrumb`, `button`, `collapsible`, `dropdown-menu`, `kbd`, `separator`, `sidebar`, `tooltip`, and `@efferd/logo`.
- Ten declared block modules: `app-breadcrumbs.tsx`, `nav-group.tsx`, `app-header.tsx`, `app-shared.tsx`, `app-sidebar.tsx`, `dashboard-skeleton.tsx`, `app-shell.tsx`, `latest-change.tsx`, `nav-user.tsx`, and `custom-sidebar-trigger.tsx`.
- `@efferd/logo` adds `components/logo.tsx`; transitive ShadCN dependencies may add input, sheet, skeleton, tooltip, and a mobile hook.

The implementation must summarize the actual CLI output because registry payloads are mutable and generated target paths can change.

**Post-install audit decision**: Preserve the core sidebar provider, inset/collapsible navigation, header/trigger, and padded main structure. Immediately replace Efferd/ecommerce demo content with SearchTrace identity and honest unavailable destinations. Remove fake user data, remote avatars, notifications, product/store actions, billing/logout, changelog/demo links, and unused demo modules. Fix the currently observed `pxx-4` class typo, suspicious numbered imports, unresolved icon placeholders, and missing accessible names before integration.

**Alternatives considered**:

- `base-nova`: rejected for this block because the current payload mixes incompatible Base and Radix composition APIs.
- Hand-built shell: rejected because the user explicitly selected the Efferd block.
- Install the block without inspection: rejected because third-party registry content is mutable and the current payload contains known product and accessibility cleanup needs.
- Keep all demo modules/content: rejected because fake account/commerce workflows conflict with the foundation specification.

**Sources**: [Efferd registry documentation](https://efferd.com/docs), [Efferd app shell catalog](https://efferd.com/blocks/app-shell), [Efferd Radix payload](https://efferd.com/r/radix-nova/app-shell-4.json), [ShadCN skills](https://ui.shadcn.com/docs/skills), [registry namespaces](https://ui.shadcn.com/docs/registry/namespace), [components.json](https://ui.shadcn.com/docs/components-json), [theming](https://ui.shadcn.com/docs/theming), and [Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4).

## Appearance and Accessibility

**Decision**: Merge generated OKLCH semantic tokens into `app/globals.css`, preserve the existing Geist variables, and apply the dark token set through `prefers-color-scheme`. Do not add `next-themes` or a user toggle. Keep `app/layout.tsx` server-rendered; allow the Efferd-derived shell to remain a synchronous Client Component where sidebar collapse/mobile interactions require it.

**Rationale**: The specification requires device-preference support and live preference changes, not a persisted user choice. Native semantic elements, a first-focusable skip link, stable label/control relationships, visible explanatory text for disabled placeholders, and restrained status live regions provide the leanest accessible baseline while retaining the selected block's interaction model.

**Alternatives considered**:

- `.dark` plus a theme provider: rejected as unnecessary state and client JavaScript.
- Snapshot-only visual assertions: rejected because they do not establish accessibility or responsive behavior.
- Automated jsdom layout claims: rejected because jsdom does not perform CSS layout, media queries, or zoom.

## Jest and Verification Strategy

**Decision**: Use Jest with `next/jest`, `jest-environment-jsdom`, React Testing Library, `user-event`, `jest-dom`, and `jest-axe`. Keep route and shell components synchronous so they can be rendered directly. Use manual browser checks for responsive overflow, system appearance, and focus-ring visibility.

**Rationale**: The installed Next.js guide explicitly supports Jest and supplies the framework-aware transformer. Jest matches the user's preference and is sufficient for synchronous components, pure configuration validation, mocked client factories, and boundary tests. React Testing Library role/name queries and `user-event` validate user-observable behavior better than implementation snapshots.

**Configuration decisions**:

- Root `jest.config.ts` wraps a jsdom configuration with `next/jest({ dir: './' })`, uses V8 coverage, loads `jest.setup.ts`, and maps `^@/(.*)$` to `<rootDir>/$1`.
- `jest.setup.ts` imports `@testing-library/jest-dom` and the selected axe matcher integration.
- Node-specific server/config cases declare a Node test environment where appropriate and mock framework boundaries; no live service is contacted.
- `bun run check` executes lint, `tsc --noEmit`, and one-shot Jest tests. Production build remains a separate quickstart gate.

**Alternatives considered**:

- Vitest: supported by Next.js but provides no material benefit for this small existing app and would add a separate transform path.
- Playwright now: best for true responsive/zoom and future async Server Components, but deferred to avoid a browser/runtime dependency before a real user flow exists.
- Snapshots as the primary guard: rejected because semantic assertions produce clearer failures and resist harmless markup changes.

**Known limitation**: Installed Next.js guidance states that Jest does not support async Server Components. If a tested route becomes async, extract synchronous presentation units for Jest and cover the async route with a later end-to-end suite.

**Sources**: Installed `node_modules/next/dist/docs/01-app/02-guides/testing/index.md`, `testing/jest.md`, and `testing/playwright.md`.

## Supabase Client and Configuration Boundaries

**Decision**: Install `@supabase/supabase-js` and `@supabase/ssr`. Provide lazy browser and async server factories, both using validated public URL/publishable-key configuration. The server module imports `server-only`; the browser module imports `client-only`. Do not instantiate a client at module load or import either factory into the shell.

**Rationale**: Current Supabase guidance uses `@supabase/ssr` for cookie-based Next.js sessions. Adding its isolated factories now avoids replacing a plain client when authentication arrives. Lazy validation lets static shell rendering work without configuration and produces deterministic failures only when an integration entry point is requested.

`getPublicSupabaseConfig()` must read the following through direct literal expressions so Next.js can inline browser-safe values correctly:

- `process.env.NEXT_PUBLIC_SUPABASE_URL`
- `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

It delegates to a pure `validatePublicSupabaseConfig(candidate)` function. The validator trims values, requires a nonblank key, accepts HTTPS URLs plus HTTP only for local Supabase hosts, and returns messages containing variable names/remediation but never supplied values.

The async server factory awaits Next.js 16's `cookies()` API and adapts `getAll`/`setAll` for `createServerClient`. It is not invoked by layouts or pages in this feature because cookie access makes callers request-time dynamic and authentication refresh is not yet in scope.

**Explicit deferrals**:

- No `proxy.ts`, middleware, route protection, sign-in, cookie refresh, or identity validation.
- No admin client, `SUPABASE_SECRET_KEY`, or legacy service-role key.
- No database schema, generated `Database` type, RLS policy, bucket, query, auth call, or storage call.
- Before authentication ships, add the then-current scoped Proxy pattern and validate server identity with the supported claims method rather than trusting an unverified session payload.

**Alternatives considered**:

- `@supabase/supabase-js` alone: simpler today but creates replacement work for cookie-based SSR auth.
- Deprecated auth helpers: rejected by current Supabase guidance.
- Eager singleton clients: rejected because they validate configuration during import and weaken the no-operation shell guarantee.
- Add an admin client now: rejected as unnecessary and dangerous; secret keys bypass row-level security.

**Sources**: [Supabase server-side client creation](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [server package choice](https://supabase.com/docs/guides/auth/choosing-a-server-package), [API keys](https://supabase.com/docs/guides/getting-started/api-keys), installed Next.js environment-variable guide, and [Next.js cookies](https://nextjs.org/docs/app/api-reference/functions/cookies).

## Environment Files

**Decision**: Commit `.env.example` with empty public variable assignments and setup comments; keep `.env.local`, `.env.test.local`, and all secrets ignored. Update `.gitignore` with the single exception `!.env.example`.

**Rationale**: Empty values demonstrate the contract without accidentally looking usable. The current `.gitignore` excludes every `.env*` file, so the explicit exception is required. Public/publishable values are browser-visible by design and provide no authorization by themselves; future database access still requires grants and RLS.

**Alternatives considered**:

- Commit plausible fake values: rejected because syntactically valid placeholders can hide incomplete setup.
- Commit `.env.test`: unnecessary because tests inject candidate values and mock factories.
- Add a secret variable to the example: rejected because no privileged workflow is specified.
