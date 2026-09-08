# Phase 1 Quickstart and Validation: Project Foundation

## Prerequisites

- Node.js 20.9 or newer
- Bun 1.4.2 or a compatible Bun release honoring the checked-in lockfile
- No Supabase account, live project, production credential, or network access is required for the automated foundation tests

## Install and Configure

```powershell
bun install --frozen-lockfile
```

The implementation must follow the verbatim installation prompt and executable interpretation in `plan.md`. For this Bun repository, the expected conditional/install sequence is:

```powershell
# Run only if the project-level ShadCN skill is absent.
bunx skills add shadcn/ui

# Run only if components.json is absent.
bunx --bun shadcn@latest init --preset radix-nova --pointer

# Add the raw @efferd registry URL to components.json first.
bunx --bun shadcn@latest view @efferd/app-shell-4
bunx --bun shadcn@latest add @efferd/app-shell-4
bunx --bun shadcn@latest info
```

Before productization, capture the CLI output and inspect all generated source/dependencies. After productization, record what was retained, removed, renamed, or fixed. The shell is not accepted while invalid imports/classes, icon placeholders, inaccessible icon triggers, remote demo assets, or fake commerce/account workflows remain.

The static shell and automated tests must work without `.env.local`. To exercise a locally configured client factory later, copy `.env.example` to `.env.local` and provide the public values shown in the Supabase project's connection settings:

```powershell
Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
```

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` belong in that file for this feature. They are browser-visible identifiers, not authorization controls. Do not add a secret/service-role key.

## Automated Foundation Gate

Run the single complete check:

```powershell
bun run check
```

Expected result: lint, strict type checking, and all Jest suites pass; the command exits successfully without contacting Supabase or another remote service.

To prove failure propagation, temporarily change one locally controlled expectation (for example, the expected SearchTrace heading), run `bun run check`, confirm the failing test and nonzero exit, then restore the edit. Do not commit the intentional failure.

Useful focused commands:

```powershell
bun run test
bun run test:watch
bun run test:coverage
bun run typecheck
```

## Run the Application

```powershell
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). With no `.env.local`, the SearchTrace shell must still render because no Supabase factory is requested.

## Manual Shell Scenarios

### Identity and honest scope

1. Confirm the page title and visible product identity say SearchTrace.
2. Confirm generic Next.js/Vercel starter logos, editing instructions, templates, documentation, and deployment actions are absent.
3. Confirm Efferd/ecommerce demo branding, navigation, fake user/avatar, notifications, product/store actions, billing/logout, and changelog content are absent.
4. Confirm future account/workspace actions are visibly unavailable and explained, not clickable broken routes.
5. Confirm the page does not claim sign-in, persistence, storage, or analysis is complete.

### Efferd shell behavior

1. Confirm the layout retains the block's inset sidebar, collapsible navigation, header/trigger, and padded main region.
2. Toggle the sidebar with pointer and keyboard; confirm state and accessible naming remain clear.
3. At a narrow viewport, open and close the mobile navigation and confirm focus is not lost behind the overlay.
4. Confirm the productized shell loads no remote avatar/image or demo data.

### Keyboard and assistive structure

1. Reload and press `Tab`; the skip link must be the first focusable element and visibly appear.
2. Activate it; focus/reading position must move to the primary `main` content.
3. Continue tabbing; available controls follow a logical order, focus is visible, and unavailable controls cannot be activated.
4. Inspect accessibility landmarks: one header, one labeled primary navigation region, and one main landmark.

### Responsive layout and zoom

Using browser responsive tools, check widths of 320, 375, 768, 1024, and 1440 CSS pixels:

1. Confirm there is no horizontal page scrollbar.
2. Confirm product identity, navigation, long status copy, cards, and controls wrap without clipping or overlap.
3. At a representative desktop and mobile width, increase browser text/page zoom to 200% and repeat the checks.
4. Switch the operating-system appearance preference while the page is open; surfaces, text, borders, status colors, and focus indicators must remain legible without a reload-dependent theme toggle.

## Configuration Failure Scenarios

The Jest configuration suite is the canonical offline proof. It must cover complete, missing, blank, malformed URL, and unsafe protocol candidates. Verify its focused output with:

```powershell
bun run test -- supabase-config
```

Expected result: valid inputs return a normalized public configuration; invalid inputs name the affected environment variables and remediation but never echo the candidate URL or key; no SDK factory or `fetch` call occurs.

## Production Compilation

After the automated and manual checks pass:

```powershell
bun run build
```

Expected result: the production application compiles with the installed Next.js version and the root route remains service-independent. Any build-time attempt to require live Supabase configuration is a failure of the lazy-boundary design.

The foundation build is offline-safe: the root layout uses local system fallbacks for the preserved Geist CSS variable names, so no Google Fonts request is required during compilation.

## Acceptance Evidence

Record the following in the implementation handoff:

- `bun run check` result and duration (target: under five minutes)
- `bun run build` result
- manual viewport/200% zoom/system-appearance results
- confirmation that shell rendering made no remote call
- confirmation that browser-reachable modules contain no privileged credential variable or value
- the raw Efferd/ShadCN installation inventory and the final retained/removed/renamed file inventory
- fixes for registry output, including imports, utility classes, icon placeholders, accessibility labels, and remote/demo content
- any generated ShadCN diff adjustments made to preserve Geist tokens and system dark mode
- the browser-width overflow and mobile-sidebar observations; 200% zoom and OS appearance must be marked unverified when the available browser surface cannot control those settings
