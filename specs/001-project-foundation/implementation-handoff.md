# Implementation Handoff: Project Foundation

## Starting inventory

- Existing app: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, strict `tsconfig.json`, Tailwind v4, Next.js 16.3.4, React 19.2.8, Bun 1.4.2.
- Existing starter assets: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`.
- No `components.json`, `components/`, `hooks/`, `lib/`, Jest configuration, or test directory existed before setup.
- Existing `.gitignore` ignored `.env*`; it now explicitly allows `.env.example` while continuing to ignore local environment files.
- Pre-existing user changes at start: `docs/prd/prd.md` modified and `specs/` untracked. They were preserved.

## ShadCN and Efferd installation

- The conditional project-level ShadCN skill command `bunx skills add shadcn/ui` installed `shadcn` and its companion `migrate-radix-to-base` skill under `.agents/skills/`.
- The mandated command `bunx --bun shadcn@latest init --preset radix-nova --pointer` was attempted. Current CLI 4.21.0 rejected the legacy preset name and listed `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, and `rhea`.
- Equivalent explicit setup completed with `bunx --bun shadcn@latest init --template next --base radix --preset nova --pointer`; the resulting `components.json` correctly records `style: radix-nova`, Tailwind v4 (`config: ""`), `app/globals.css`, root aliases, RSC/TypeScript output, and Lucide icons.
- Registry declaration added without replacing existing registries: `@efferd: https://efferd.com/r/{style}/{name}.json`.
- `bunx --bun shadcn@latest view @efferd/app-shell-4` confirmed a `registry:block` described as an inset sidebar with collapsible navigation and padded main shell. It declared avatar, breadcrumb, button, collapsible, dropdown-menu, kbd, separator, sidebar, tooltip, and `@efferd/logo` dependencies.
- Installation created 23 files and skipped the pre-existing identical `components/ui/button.tsx`:

  `components/ui/avatar.tsx`, `breadcrumb.tsx`, `collapsible.tsx`, `dropdown-menu.tsx`, `kbd.tsx`, `separator.tsx`, `sidebar.tsx`, `tooltip.tsx`, `input.tsx`, `skeleton.tsx`, `sheet.tsx`, `components/logo.tsx`, `hooks/use-mobile.ts`, and the ten block files `app-breadcrumbs.tsx`, `nav-group.tsx`, `app-header.tsx`, `app-shared.tsx`, `app-sidebar.tsx`, `dashboard-skeleton.tsx`, `app-shell.tsx`, `latest-change.tsx`, `nav-user.tsx`, `custom-sidebar-trigger.tsx`.

- The CLI warned that `TooltipProvider` must wrap the app; `AppShell` now provides it.
- Foundation primitives added after reconciliation: `card`, `alert`, `spinner`, `label`, and `field`; `button`, `input`, and `skeleton` were already installed.

## Audit and productization

The raw payload contained these numbered imports: `app-header.tsx` referenced `@/components/1/app-breadcrumbs` and `@/components/2/custom-sidebar-trigger`, while `app-sidebar.tsx` referenced `@/components/2/nav-group`. It also contained the `pxx-4` utility in `app-header.tsx`; unresolved `IconPlaceholder` usage in `nav-group.tsx`, `app-header.tsx`, `app-shared.tsx`, `app-sidebar.tsx`, `latest-change.tsx`, and `nav-user.tsx`; unnamed icon-only controls; a remote GitHub avatar in `nav-user.tsx`; fake Efferd user data; commerce routes/actions; notifications; billing/logout; and changelog content. All were removed or fixed before product tests.

Retained and adapted: `app-shell.tsx`, `app-sidebar.tsx`, `app-header.tsx`, `app-breadcrumbs.tsx`, `custom-sidebar-trigger.tsx`, `nav-group.tsx`, `app-shared.tsx`, and `logo.tsx`. The provider, inset sidebar, icon collapse behavior, accessible trigger, mobile Sheet behavior, header/current-location region, and padded main structure remain.

Removed as demo-only: `nav-user.tsx`, `latest-change.tsx`, and `dashboard-skeleton.tsx`. Replaced with `foundation-status.tsx` and `foundation-skeleton.tsx`. The generated logo was replaced with a SearchTrace trace mark.

Fixed: direct Lucide icon components with decorative `aria-hidden`, named sidebar and skip controls, disabled future actions with visible explanation, exactly one `main#main-content`, skip-link focus handling, responsive `min-w-0`/wrapping, semantic OKLCH tokens, system dark mode, and a `useSyncExternalStore` mobile media-query hook that passes current React lint rules.

## Packages and verification

- Added runtime packages: `class-variance-authority`, `cn`, `lucide-react`, `radix-ui`, `shadcn`, `tw-animate-css`, `@supabase/supabase-js@2.116.0`, `@supabase/ssr@0.12.6`, `server-only`.
- Added test packages: Jest 30, `jest-environment-jsdom`, React Testing Library, user-event, jest-dom, jest-axe, and required Jest type packages.
- Added `typecheck`, `test`, `test:watch`, `test:coverage`, and ordered offline `check` scripts.
- `bun run typecheck`: PASS.
- `bun run lint`: PASS.
- `bun run test`: PASS — 12 suites, 28 tests.
- `bun run build`: PASS — Next.js 16.3.4 static production build, 18.92s. The initial offline build exposed `next/font/google` network fetching; the starter font import was replaced with local system fallbacks while preserving the Geist CSS variable names.
- Final `bun run check`: PASS — lint, strict typecheck, and 12 Jest suites/28 tests; Jest completed in 12.208s.
- Supabase tests cover lazy import/validation, HTTPS/local URL acceptance, missing/blank/malformed/unsafe configuration, error redaction, browser factory delegation, server cookie adapters, and shell no-call behavior.
- Focused `bun run test -- supabase-config`: PASS — 1 suite, 9 tests, 12.373s.
- The test suite and shell render with no `.env.local`; no Supabase factory or `fetch` call occurs during shell rendering.

## Browser verification boundary

- Local browser checks were run against the development root at widths 320, 375, 768, 1024, and 1440. The measured document scroll width did not exceed the viewport at any width (`305/320`, `360/375`, `753/768`, `1009/1024`, and `1440/1440` respectively), so no horizontal overflow was observed.
- At 375px the mobile trigger opened the retained sidebar Sheet/dialog; its SearchTrace identity, primary navigation, disabled future actions, and visible unavailability explanation were present.
- A rendered desktop inspection showed wrapped heading/status copy, visible focus treatment classes, readable semantic surfaces, and no remote image/avatar.
- The browser control surface did not expose a reliable page-zoom setter; keyboard zoom attempts did not change the measurable CSS viewport. 200% zoom and an OS appearance toggle therefore remain explicitly deferred to a human browser pass rather than being claimed as verified.

## Deferred work

Authentication, Proxy/cookie refresh, identity verification, database schema, RLS, storage, résumé extraction, AI analysis, admin/secret clients, live data operations, and product workflows remain intentionally out of scope. Real-browser responsive/zoom/system-appearance checks are manual-only because jsdom cannot prove CSS layout or media-query behavior.
