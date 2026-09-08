# App Shell and UI Contract

## Route Contract: `/`

The root route is a service-independent foundation page composed through the installed `@efferd/app-shell-4` structure. It must render successfully with both public Supabase variables absent and must not import or call either Supabase factory. The route/layout remain server-renderable even though the nested sidebar shell may be a synchronous Client Component for collapse and mobile behavior.

## Block Provenance Contract

- The implementation begins with the installed Efferd block, not a hand-built visual approximation.
- Retained structural elements are the sidebar provider, inset sidebar, collapsible navigation, accessible sidebar trigger/header, and padded main content region.
- The implementation handoff records the installed registry item, every generated/modified file and package, files retained after adaptation, files removed as demo-only, warnings/fixes, and remaining follow-up work.
- Registry-generated source is treated as repository-owned code after installation and receives the same review, lint, type, accessibility, and test gates as handwritten code.

## Required Document Interface

| Element | Contract |
|---|---|
| Metadata | Title identifies `SearchTrace`; description states the evidence-gap purpose without promising an implemented workflow. |
| Skip link | First keyboard-focusable element; links to `#main-content`; becomes visibly apparent on focus. |
| Header | Adapts the Efferd header and trigger; contains SearchTrace identity/current location and an accessible sidebar control. |
| Navigation | Uses the block's inset/collapsible sidebar. Current available destination is represented honestly. Deferred account/workspace destinations use disabled or unavailable semantics with visible explanation and are not broken links. |
| Main | The adapted `SidebarInset` is exactly one primary `main` landmark with `id="main-content"`; accepts routed children and remains focusable as the skip-link target. |
| Page content | Replaces all Create Next App/Vercel starter logos, instructions, documentation, template, and deployment links with SearchTrace-specific foundation content. |

## Responsive Contract

- The shell uses mobile-first spacing, wrapping, and `min-width: 0` behavior so content does not force horizontal page overflow from 320 through 1440 CSS pixels.
- Product identity, navigation, and status copy may wrap; they must not overlap or clip.
- At 200% text enlargement, every action and explanation remains visible and reachable.
- System light/dark changes update semantic colors without a persisted theme or client-side theme provider.

## Baseline Primitive Contract

The checked-in ShadCN primitives cover:

| Need | Primitive/composition | Required states |
|---|---|---|
| Action | Button | default, focus-visible, disabled, busy composition |
| Text entry and label | Input + Field/FieldLabel | labeled, described, disabled, invalid |
| Content container | Card | title, description, content, footer composition |
| Status/error/unavailable | Alert + FoundationStatus | informational, warning, error, polite status |
| Loading | Skeleton + Spinner + visible text | decorative placeholder, named busy state |

All controls use native semantics, stable accessible names, visible focus indicators, and readable semantic color tokens. Decorative icons/skeletons are hidden from assistive technology. Dynamic errors use `role="alert"` only when immediate interruption is justified; normal changing status uses `role="status"`/polite live behavior.

## Forbidden Behavior

- No sign-in, sign-up, route protection, data query, file action, AI action, or application workflow is presented as functional.
- No click handler is added solely to simulate unfinished navigation.
- No user-authored or remote content is rendered.
- No shell import causes environment validation, cookie access, client creation, or network activity.
- No Efferd/ecommerce demo brand, fake user, remote avatar, Dashboard/Sales/Store/Orders/Products/Customers/Marketing link, notification, add-product/search-store action, plan/billing/logout control, or changelog content remains in the productized shell.
- No unresolved `IconPlaceholder`, suspicious numbered component import, invalid utility class, or unnamed icon-only trigger remains after installation review.

## Verification Mapping

- FR-001–FR-003: semantic render tests, block-structure assertions, collapse/trigger behavior, and explicit absence checks for starter/demo content.
- FR-004 and FR-007: manual viewport, zoom, and system-appearance procedure in `quickstart.md`; automated tests cover structural invariants only.
- FR-005–FR-006: representative primitive compositions, role/name queries, keyboard tab order, disabled/busy/invalid assertions, and axe checks.
- FR-014–FR-015: mocked Supabase factories/fetch remain untouched during shell rendering; visible copy states deferrals.
