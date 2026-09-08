# Implementation Plan: Project Foundation

**Branch**: `001-project-foundation` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-project-foundation/spec.md`

## Summary

Replace the generated starter experience with a responsive, accessible SearchTrace application shell built from the mandated `@efferd/app-shell-4` ShadCN registry block on the existing Next.js App Router and Tailwind CSS setup. Initialize ShadCN with the Radix-compatible preset required by the block, install and audit the block and its registry dependencies, then adapt its inset sidebar, collapsible navigation, header, and padded main region to honest SearchTrace placeholders. Add lazy browser and server Supabase client factories with validated public configuration and strict server-only boundaries, plus an offline Jest/React Testing Library baseline. A single `bun run check` command will run linting, type checking, and deterministic foundation tests without a live Supabase project.

## Technical Context

**Language/Version**: TypeScript 5 in strict mode; Node.js 20.9 or newer as required by installed Next.js; Bun 1.4.2 package manager

**Primary Dependencies**: Next.js 16.3.4 App Router, React 19.2.8, Tailwind CSS 4, ShadCN CLI v4 `radix-nova`/Radix primitives, Efferd `@efferd/app-shell-4` registry block, Lucide icons, Zod 4, `@supabase/supabase-js`, `@supabase/ssr`

**Storage**: N/A for this feature; no schema, migration, table, bucket, or persisted domain record is introduced

**Testing**: Jest through `next/jest`, `jest-environment-jsdom`, React Testing Library, `@testing-library/user-event`, `@testing-library/jest-dom`, and `jest-axe`; manual browser checks cover behavior that jsdom cannot measure

**Target Platform**: Modern desktop and mobile web browsers supported by Next.js; server execution on a Node.js-compatible Next.js host

**Project Type**: Single full-stack web application with App Router routes and shared root-level `components/` and `lib/` modules

**Performance Goals**: Static shell rendering initiates zero remote product-data operations; the complete automated foundation check finishes in under five minutes on a normal contributor workstation

**Constraints**: Usable from 320–1440 CSS pixels and at 200% text enlargement; system-driven light/dark appearance; tests require no network or live Supabase account; no privileged credential may be reachable from browser code; configuration validation is lazy and errors never echo values; no authentication, Proxy, RLS, storage, domain schema, or product workflow in this slice

**Scale/Scope**: One Efferd-derived shared shell, one foundation home page, the block's ten declared modules plus logo and resolved UI dependencies, three explicitly required foundation primitives when not already resolved, two Supabase client factories, pure configuration validation, and focused unit/component/boundary test suites

## Constitution Check

### Pre-Research Gate

| Constitutional area | Result | Plan evidence |
|---|---|---|
| I. Evidence Before Inference | PASS | No extraction, coverage assessment, citation, or AI interpretation is introduced. Placeholder copy makes the absence of product analysis explicit. |
| II. Human Review and Control | PASS | No AI output, record mutation, résumé rewriting, application submission, messaging, or URL fetching is introduced. |
| III. Privacy, Isolation, and Explicit Consent | PASS | No user data is stored or transmitted. Public Supabase configuration is separated from server-only modules; no secret/admin client is added; shell rendering performs no remote operation. |
| IV. Bounded and Honest AI | PASS | No AI provider, request, output, or fallback is introduced. |
| V. Lean, Testable Delivery | PASS | Scope is limited to the shared foundation and uses low-level deterministic tests plus explicit manual checks for real-browser layout. |
| Product and technical constraints | PASS | The plan preserves the mandated Next.js, TypeScript, Tailwind, Supabase, and future server-validation architecture without prematurely adding schema or workflows. |
| Workflow and quality gates | PASS | Each artifact and test group traces to FR-001–FR-016; configuration failure, browser/server boundaries, accessibility, and placeholder behavior are covered. |

No constitutional violation requires an exception or complexity justification.

### Post-Design Gate

PASS. Phase 1 keeps all foundation interfaces inside the approved architecture. The data model contains only transient configuration and presentation value objects; the contracts prohibit live data calls, secret-bearing client code, admin clients, unreviewed product behavior, and claims that deferred workflows exist. The quickstart includes offline checks, failure-state verification, real-browser accessibility/responsiveness review, and a production build check. No gate changed from the pre-research evaluation.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── app-shell.md
│   ├── supabase-clients.md
│   └── verification.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
app/
├── globals.css              # Tailwind v4 + ShadCN semantic tokens and system dark mode
├── layout.tsx               # SearchTrace metadata, fonts, and shared AppShell wiring
└── page.tsx                 # Honest foundation/availability content; no live workflow

components/
├── app-shell.tsx            # Efferd inset/collapsible shell, adapted for SearchTrace
├── app-sidebar.tsx          # SearchTrace navigation adapted from the block
├── app-header.tsx           # Header and accessible sidebar trigger
├── app-breadcrumbs.tsx      # Current-location composition for real routes only
├── custom-sidebar-trigger.tsx
├── nav-group.tsx
├── logo.tsx                 # SearchTrace identity replacing Efferd branding
├── foundation-status.tsx    # Accessible unavailable/loading/status composition
├── foundation-skeleton.tsx  # Product-specific loading composition
└── ui/                      # ShadCN dependencies resolved by the block + additions
    ├── alert.tsx            # Added if not resolved transitively
    ├── avatar.tsx
    ├── breadcrumb.tsx
    ├── button.tsx
    ├── card.tsx             # Added if not resolved transitively
    ├── collapsible.tsx
    ├── dropdown-menu.tsx
    ├── field.tsx            # Added if not resolved transitively
    ├── input.tsx
    ├── kbd.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── skeleton.tsx
    ├── spinner.tsx          # Added if not resolved transitively
    └── tooltip.tsx

hooks/
└── use-mobile.ts            # Responsive sidebar dependency

lib/
├── utils.ts                 # ShadCN class-name helper
└── supabase/
    ├── config.ts            # Pure public-config validation and safe error type
    ├── client.ts            # Lazy browser-client factory; client-only boundary
    └── server.ts            # Lazy async server-client factory; server-only boundary

__tests__/
├── app-shell.test.tsx
├── ui-foundation.test.tsx
├── supabase-config.test.ts
├── supabase-client.test.ts
└── supabase-server.test.ts

.env.example                 # Empty public variable names and safe setup comments
components.json              # ShadCN radix-nova config + raw @efferd registry template
jest.config.ts
jest.setup.ts
package.json                 # test, typecheck, check, and watch scripts
bun.lock
.gitignore                   # Explicitly permits committed .env.example only
README.md                    # Foundation setup, commands, configuration, deferrals
```

**Structure Decision**: Keep the existing root-level App Router structure and install the Efferd block into its default root `components/` destinations. Retain the block's core `SidebarProvider`/inset sidebar, collapsible navigation, header trigger, and padded main structure. Remove generated demo-only modules such as fake user, shared ecommerce links, and latest-change content when they are not needed after productization; rename the dashboard skeleton to a SearchTrace foundation composition. The shell may be a synchronous Client Component because the sidebar is interactive, while `app/layout.tsx` remains a thin Server Component. Supabase factories stay isolated by runtime boundary and are never imported or invoked by the shell.

## Required App Shell Installation Prompt

Preserve and use the following user-supplied prompt verbatim during implementation:

````text
Install the @efferd/app-shell-4 block into this project.
Steps:
1. Install the shadcn skill if missing: bunx skills add shadcn/ui
2. Ensure this is a shadcn project (has components.json). If not, run: npx shadcn@latest init
3. Add the @efferd registry to components.json (if missing):
{
"registries": {
"@efferd": "[https://efferd.com/r/{style}/{name}.json](https://efferd.com/r/{style}/{name}.json)"
}
}
4. Run: bunx shadcn@latest add @efferd/app-shell-4
After install, summarize what was added and any next steps.
````

### Executable Interpretation

The prompt above is preserved exactly, but its Markdown link syntax is not valid as a JSON registry value. The implementation MUST store this raw template in `components.json`:

```json
{
  "registries": {
    "@efferd": "https://efferd.com/r/{style}/{name}.json"
  }
}
```

Because this repository uses Bun and the block's current payload is Radix-oriented, use these Bun-normalized executable commands while satisfying the prompt's intent:

```powershell
bunx skills add shadcn/ui
bunx --bun shadcn@latest init --preset radix-nova --pointer
bunx --bun shadcn@latest add @efferd/app-shell-4
```

Run the skill-install command only if the project-level ShadCN skill is absent. Run `init` only if `components.json` is absent. Before adding the block, use the CLI's `view` command when available and record the registry payload; after adding it, summarize created/modified files, resolved registry dependencies, package changes, warnings, and SearchTrace-specific adaptation still required.

## Implementation Sequence

1. Follow the required prompt and executable interpretation above: install the ShadCN agent skill only if missing, initialize the existing app as `radix-nova` only if needed, add the raw `@efferd` namespace, inspect the registry item, and install `@efferd/app-shell-4`.
2. Inventory and summarize the block's ten declared modules, `@efferd/logo`, ShadCN registry dependencies, package changes, and any CLI warnings before product-specific edits.
3. Audit generated output before use: fix invalid import rewrites, the known `pxx-4` typo, unresolved `IconPlaceholder` references, and accessibility issues; run type checking immediately so registry defects are isolated from later edits.
4. Productize rather than replace the block: retain its inset sidebar/collapse/header/main structure; apply SearchTrace branding/navigation/content; remove ecommerce demo links, fake user/avatar, notifications, product actions, billing/logout, and other implied workflows; add a skip link and make `SidebarInset` the single `main#main-content`.
5. Add `button`, `input`, `field`, `card`, `alert`, `skeleton`, and `spinner` only where the block's dependencies did not already install them; preserve Geist tokens and adapt dark tokens to system preference without a theme provider.
6. Add pure public Supabase configuration validation, then lazy browser/server factories. Do not add Proxy, middleware, admin/secret clients, generated database types, auth calls, queries, storage calls, or eager singletons.
7. Configure Jest through `next/jest`; add semantic, sidebar interaction, keyboard, accessibility, configuration-failure, factory-mocking, and no-eager-call tests. Keep responsive overflow and zoom verification in the quickstart because jsdom cannot measure layout.
8. Add `typecheck`, `test`, `test:watch`, `test:coverage`, and `check` scripts. `check` composes lint, type checking, and one-shot Jest tests and must remain offline.
9. Update `.env.example`, `.gitignore`, and README, then run `bun run check`, `bun run build`, and the manual quickstart scenarios. The handoff summary must distinguish raw block output from final retained/adapted files and list any follow-up work.

## Design Risks

- **Third-party registry trust and drift**: `shadcn@latest` and Efferd registry payloads are mutable. Inspect the item before installation, review every generated file and dependency, pin resolved packages in `bun.lock`, and retain an installation inventory in the handoff.
- **Radix/Base mismatch**: The current Base payload mixes Base `render` with Radix-only `asChild` composition. Use `radix-nova`; choosing Base would require a separate full conversion and accessibility audit.
- **Known block defects**: Current payload inspection found `pxx-4`, suspicious numbered import paths, icon placeholders, unnamed icon triggers, a remote demo avatar, and fake commerce routes/content. Typecheck and productize the block before considering the shell complete.
- **SSR package instability**: `@supabase/ssr` remains beta. Isolate it behind two factories so a future API change is localized.
- **False browser-test confidence**: jsdom does not calculate responsive overflow, media-query rendering, visual focus rings, or 200% zoom. Automated semantic checks are supplemented by explicit real-browser validation rather than claiming coverage Jest cannot provide.
- **Premature authentication behavior**: Server client creation without a Proxy cannot yet provide complete cookie refresh behavior. This limitation is documented and authentication work must add the current scoped Proxy pattern before relying on sessions.
- **Environment leakage**: Only literal `NEXT_PUBLIC_*` accesses appear in browser-safe modules. No service-role/secret variable is required, read, re-exported, logged, or passed through props in this feature.
