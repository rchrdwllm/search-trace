<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — SearchTrace Agent Guide & Architecture Manual

This document provides coding agents with authoritative architectural context, engineering conventions, security boundaries, and command workflows for the **SearchTrace** repository.

---

## 1. Project Overview

**SearchTrace** is a private, evidence-gap analysis application for job seekers applying to software engineering roles. It analyzes **one job opportunity at a time**: a user uploads the résumé used for that opportunity, pastes the job description, optionally adds project evidence and employer feedback, and receives an AI-generated, cited assessment of supported, weak, and missing requirements, accompanied by exactly one bounded next action.

### Core Value Proposition
> "See which requirements your submitted evidence supports, where it is weak, and one concrete thing to improve before the next application."

SearchTrace is an **evidence-gap analyzer**, strictly distinguishing between submitted facts and AI interpretation.

### Scope & Explicit Non-Goals (Release Blockers)
- **NOT** an ATS score generator, interview probability calculator, or hiring predictor.
- **NOT** a résumé re-writer, cover-letter generator, or automated job-application bot.
- **NOT** a job-search CRM, application tracker, funnel dashboard, or cross-opportunity analytics engine.
- **NO** job scraping, URL crawling, email ingestion, or browser extensions.
- **NO** public profiles, multi-tenant team workspaces, or public demo accounts.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Runtime & Package Manager** | Bun `1.4.2` | Node.js `20.9+` compatible. Always use `bun` commands. |
| **Framework** | Next.js `16.3.4` (App Router) | React `19.2.8`, React DOM `19.2.8`, Server & Client Components. |
| **API Layer** | tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`) | End-to-end type safety, SuperJSON transformer, Zod schema validation. |
| **Client State & Cache** | TanStack React Query v5 | Integrated with tRPC query/mutation hooks. |
| **Authentication** | Better Auth `1.7.3` | Email/password credentials, Drizzle adapter, secure HTTP-only cookies. |
| **Database & ORM** | PostgreSQL hosted on Supabase; Drizzle ORM `0.45.2` | Drizzle Kit `0.31.10`, `postgres` client, `@electric-sql/pglite` for offline tests. |
| **File Storage** | Supabase Storage | Private résumé bucket; signed, short-lived URLs; user-scoped paths. |
| **Styling & UI** | Tailwind CSS v4, Radix UI, Lucide Icons | `@tailwindcss/postcss`, `shadcn` 4.21.0 (`radix-nova` style), `class-variance-authority`. |
| **Testing** | Jest `30.5.1` (with `--experimental-vm-modules`) | `jest-environment-jsdom`, React Testing Library, `jest-axe`, PGlite. |

---

## 3. Essential Commands & Development Workflow

All tasks must be run via `bun`. Do not use `npm`, `yarn`, or `pnpm`.

### Installation & Server
```powershell
# Install dependencies with locked versions
bun install --frozen-lockfile

# Start local development server (http://localhost:3000)
bun run dev

# Compile for production
bun run build

# Run production build locally
bun run start
```

### Verification & Testing Gate
The codebase enforces an offline, zero-credential quality gate. It must pass without network, credentials, or running database.

```powershell
# Run the complete quality gate (Lint + Strict Typecheck + One-shot Jest)
bun run check

# Individual verification steps
bun run lint            # ESLint 9 flat config
bun run typecheck       # tsc --noEmit (strict TypeScript checks)
bun run test            # One-shot Jest test suite (NODE_OPTIONS=--experimental-vm-modules jest --runInBand)
bun run test:watch      # Interactive Jest watch mode
bun run test:coverage   # One-shot Jest with V8 coverage report

# Run a specific test file or pattern
bun run test -- tests/004-type-safe-api-migration/procedures/system-contract.test.ts
bun run test -- -t "system router contract"
```

### Database & Migration Commands
```powershell
# Generate SQL migration after updating lib/db/schema.ts
bun run db:generate -- --name <migration_name>

# Apply pending migrations to the intentionally configured DATABASE_URL
bun run db:migrate
```

---

## 4. Environment Configuration & Secrets

Copy `.env.example` to `.env.local` for local integration testing.

```ini
# --- Browser-Safe Public Configuration ---
# Public Supabase project URL (must be HTTPS, or HTTP for localhost)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# Public Supabase Anon / Publishable Key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test_key

# --- Server-Only Private Secrets (NEVER expose to browser) ---
# Direct PostgreSQL connection string for Drizzle ORM
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Better Auth signing secret (minimum 32 characters)
BETTER_AUTH_SECRET=example_secret_must_be_at_least_32_characters_long
# Canonical application origin URL
BETTER_AUTH_URL=http://localhost:3000
```

### Critical Security Rules for Environment Variables
1. **Never import `DATABASE_URL` or `BETTER_AUTH_SECRET` in client code**. Tests strictly assert their absence from browser bundles.
2. **Offline-First Resilience**: The application shell and tests render and execute cleanly even if Supabase and Better Auth environment variables are absent.
3. **No Service-Role Key**: The application does not require or store Supabase service-role/admin keys in the client or server repositories.

---

## 5. Repository Structure & Directory Map

```
search-trace/
├── app/                              # Next.js 16 App Router
│   ├── (auth)/                       # Unauthenticated auth routes
│   │   ├── sign-in/page.tsx          # Sign-in page (email/password)
│   │   └── sign-up/page.tsx          # Registration page
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # Better Auth route handler (toNextJsHandler)
│   │   └── trpc/[trpc]/route.ts      # tRPC HTTP handler (fetchRequestHandler)
│   ├── dashboard/                    # Private workspace routes
│   │   ├── layout.tsx                # Dashboard layout wrapping AppShell
│   │   ├── page.tsx                  # Dashboard landing view
│   │   └── opportunities/            # Opportunity detail, creation, editing
│   ├── favicon.ico
│   ├── globals.css                   # Tailwind v4 theme & CSS variable declarations
│   ├── layout.tsx                    # Root layout with TRPCClientProvider
│   └── page.tsx                      # Root resolver (redirects to /dashboard or /sign-in; test fallback)
├── components/                       # UI components
│   ├── app-breadcrumbs.tsx           # Accessible location breadcrumbs
│   ├── app-header.tsx                # Shell header with sidebar toggle & location
│   ├── app-shell.tsx                 # Core AppShell (@efferd/app-shell-4 adaptation)
│   ├── app-sidebar.tsx               # Collapsible inset sidebar
│   ├── auth/                         # Auth forms (sign-in-form, sign-up-form, sign-out-button)
│   └── ui/                           # Checked-in Shadcn primitives (button, card, alert, input, etc.)
├── docs/                             # Product documentation & PRD
│   ├── authentication.md             # Better Auth architecture & security rules
│   └── prd/prd.md                    # Core MVP requirements & data model
├── drizzle/                          # Generated Drizzle migrations & metadata ledger
├── lib/
│   ├── auth.ts                       # Server-only Better Auth instance
│   ├── auth-client.ts                # Client-safe Better Auth client (createAuthClient)
│   ├── auth/                         # Session resolution (requireSession), schemas, origins
│   ├── db/
│   │   ├── config.ts                 # Validates DATABASE_URL
│   │   ├── index.ts                  # Drizzle database client factory (server-only)
│   │   └── schema.ts                 # Canonical Drizzle database schema
│   ├── supabase/
│   │   ├── client.ts                 # Client-safe Supabase browser client (client-only)
│   │   ├── config.ts                 # Public Supabase config validation
│   │   └── server.ts                 # Server-side Supabase client (server-only)
│   └── utils.ts                      # Shared utility functions (cn)
├── proxy.ts                          # Next.js 16 proxy routing middleware (/dashboard cookie prefilter)
├── scripts/                          # Operational maintenance scripts
│   └── db/migrate.ts                 # Programmatic Drizzle migrator
├── specs/                            # SpecKit feature specs, plans, tasks & contracts
│   ├── 001-project-foundation/       # Foundation shell & accessibility contracts
│   ├── 002-drizzle-supabase-setup/   # Drizzle schema workflow & DB isolation
│   ├── 003-user-authentication/      # Better Auth integration & session contracts
│   └── 004-type-safe-api-migration/  # tRPC v11 migration & boundary inventory
├── tests/                            # Test suites partitioned by spec feature
│   ├── 001-project-foundation/       # Shell, accessibility, primitives, and mock isolation
│   ├── 002-drizzle-supabase-setup/   # DB configs, static boundaries, migration tests
│   └── 004-type-safe-api-migration/  # System router, auth forms, boundary inventory
├── trpc/                             # Application tRPC API layer
│   ├── client.tsx                    # Client-side tRPC React Query provider & hooks
│   ├── init.ts                       # tRPC context, procedures, error formatting
│   ├── query-client.ts               # Shared TanStack QueryClient factory
│   ├── routers/                      # Domain routers (system, _app)
│   │   ├── _app.ts                   # Root AppRouter definition
│   │   └── system.ts                 # System health and session procedures
│   └── server.tsx                    # Server Component caller (getTRPCCaller)
└── components.json                   # Shadcn registry & styling configuration
```

---

## 6. Architecture & Core Subsystems

### 6.1 API Layer: tRPC v11 Architecture
SearchTrace uses **tRPC v11** as its sole application API boundary.

1. **Routing & Mounting**:
   - HTTP endpoint mounted at `/api/trpc/[trpc]` via `fetchRequestHandler`.
   - Root router `appRouter` in `trpc/routers/_app.ts` composes domain routers (e.g., `systemRouter`).
   - Domain routers are noun-named under `trpc/routers/<noun>.ts`.

2. **Consumption Rules**:
   - **Server Components (RSC)**: MUST call `await getTRPCCaller()` from `trpc/server.tsx`. They invoke procedures **in-process**; they **never** self-fetch `/api/trpc` over HTTP.
   - **Client Components**: Use `useTRPC()` hook with TanStack Query options from `trpc/client.tsx`. Wrapped at the root by `TRPCClientProvider`.

3. **Procedure Lifecycle & Security Pipeline**:
   Every procedure MUST follow this sequential lifecycle:
   $$\text{Input Validation (Zod)} \longrightarrow \text{Authentication (Session)} \longrightarrow \text{Authorization (Ownership)} \longrightarrow \text{Domain Effects}$$

   - **Validation**: Every procedure requires an explicit Zod input schema.
   - **Authentication**: Use `protectedProcedure` for any private operation. It guarantees `ctx.session` and `ctx.actorId` exist. `publicProcedure` is reserved exclusively for intentionally anonymous endpoints.
   - **Ownership & Non-Enumeration**: Queries combining `ctx.actorId` with record identifiers must prevent existence leakage. If a resource is missing OR owned by another user, call `unavailableResource()`:
     ```typescript
     import { unavailableResource } from "@/trpc/init";
     // Throws TRPCError({ code: "NOT_FOUND", message: "The requested resource is unavailable." })
     ```
   - **Safe Error Formatter**: All unexpected server errors are masked as `"Unable to complete that request. Please try again."` with safe error codes (`BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`).

### 6.2 Database & Drizzle ORM
Drizzle ORM is the **sole owner** of application schema definitions and migration generation.

1. **Schema Authority**:
   - Defined solely in `lib/db/schema.ts`.
   - Better Auth tables (`user`, `session`, `account`, `verification`) reside in the `public` Postgres schema, but table privileges for `anon` and `authenticated` roles are revoked. Data API access is prohibited; tables are accessed exclusively via server-side Drizzle connections.
   - Domain tables (`opportunities`, `resumes`, `evidence_items`, `feedback_items`, `requirements`) are user-scoped with foreign keys to `user.id`.

2. **Migration Discipline**:
   - **NEVER** run `drizzle-kit push`.
   - **NEVER** modify schema directly in the Supabase Dashboard.
   - **NEVER** maintain competing Supabase migration histories for application tables.
   - Always run `bun run db:generate -- --name <name>`, review both `schema.ts` and the generated SQL/meta under `drizzle/`, and commit them together.

### 6.3 Authentication & Authorization (Better Auth)
Authentication is powered by **Better Auth 1.7.3**.

1. **Session Enforcement**:
   - **Authoritative Check**: `requireSession()` and `getSession()` in `lib/auth/session.ts` read request headers server-side. Every protected layout, server page, and tRPC context relies on this check.
   - **Non-Authoritative Prefilter**: `proxy.ts` inspects cookies for `/dashboard/:path*` to provide quick redirects to `/sign-in?next=...`. `proxy.ts` is an optimization, **never** an authorization boundary.
2. **Client-Side Auth**:
   - Client forms use `authClient` from `lib/auth-client.ts` (`better-auth/react`).
   - Server Actions for authentication forms have been completely removed in favor of `authClient` with generic, safe error reporting.
3. **Registration & Passwords**:
   - Sign-up creates an active session immediately.
   - Passwords and tokens must never be logged or returned in procedure errors.

### 6.4 Boundary Isolation & "Server-Only" Hygiene
The repository enforces strict module separation verified by automated tests:

- **Server-Only Files**: Add `import "server-only";` at the top of all private files:
  - `lib/db/index.ts`
  - `lib/auth.ts`
  - `lib/auth/session.ts`
  - `lib/supabase/server.ts`
  - `trpc/init.ts`
  - `trpc/server.tsx`
- **Client-Only Files**: Add `"use client";` and `import "client-only";` where applicable:
  - `lib/supabase/client.ts`
  - `trpc/client.tsx`
- **Static Boundary Invariant**: `DATABASE_URL`, `@/lib/db`, and `@/lib/auth` must **never** be imported into any browser-reachable module (`app/page.tsx`, `app/layout.tsx`, `components/auth/*`, `lib/supabase/client.ts`).

---

## 7. UI, Styling & Accessibility Standards

The visual design system is built on **Tailwind CSS v4** and customized **Shadcn UI** components adapted from `@efferd/app-shell-4`.

### Accessibility Invariants (Strictly Enforced)
1. **Single `<main>` Landmark**: The app shell's `SidebarInset` is configured as the **only** primary `<main>` landmark with `id="main-content"`. Pages rendered inside must never introduce a second `<main>`.
2. **Keyboard Skip Link**: The first focusable element on every page must be the skip link targeting `#main-content`:
   ```tsx
   <a href="#main-content">Skip to main content</a>
   ```
3. **Screen Reader Live Regions**:
   - Non-urgent status changes: Use `role="status"` with polite announcement (`<Alert role="status">` or `FoundationStatus`).
   - Urgent destructive errors: Use `role="alert"` only when immediate interruption is justified.
4. **Form Controls**: All inputs must have associated `<Label>`, explicit `id`, accessible descriptions (`aria-describedby`), and invalid indicators (`aria-invalid`).
5. **Automated Axe Testing**: Interactive components and pages must pass `jest-axe` tests with zero violations (`expect(container).toHaveNoViolations()`).
6. **Responsive Spacing**: Layouts must not produce horizontal overflow across standard widths: 320px, 375px, 768px, 1024px, and 1440px, and must remain fully usable at 200% browser zoom.

---

## 8. AI System Guidelines & Data Privacy

When implementing or extending the structured AI analysis pipeline:

1. **Authorized Inputs**:
   - Only include: stored job description, user-reviewed résumé text (after explicit opt-in), manual evidence items, and opted-in feedback items.
   - All sensitive data toggles must be **OFF by default**.
2. **Structured Outputs with Zod**:
   - Every AI provider call must return structured JSON validated against a server-side Zod schema.
   - Requirements must be classified into `technical_skill`, `experience`, `education`, `responsibility`, or `other`.
   - Coverage states must be `supported`, `weak`, `missing`, or `unknown`.
   - Citations must include exact verbatim excerpts from user-provided sources.
   - Exactly **one** next action must be proposed, tied directly to a weak or missing requirement.
3. **No Output Hallucinations**:
   - AI outputs are saved as **reviewable drafts**. The user can edit, correct, or discard requirements before saving.
   - The AI must never modify source résumé text, send applications, or fetch external URLs.
4. **Privacy & Logging Prohibition**:
   - **NEVER** log raw résumés, job descriptions, feedback text, full prompts, or raw model outputs in server logs.

---

## 9. Testing & Quality Assurance

SearchTrace maintains high testing rigor partitioned by feature specifications:

### Test Directory Conventions
- `tests/001-project-foundation/`: Structural invariants, app shell interactions, accessibility (`jest-axe`), static boundaries, and clean environment helpers.
- `tests/002-drizzle-supabase-setup/`: Database configuration parsing, server-only import boundaries, migration idempotency using in-memory PGlite.
- `tests/004-type-safe-api-migration/`: tRPC router contracts, auth form behaviors, and the migration inventory test.

### Writing New Tests
- Use `describe` and `it` blocks matching acceptance criteria.
- Use `renderWithCleanEnvironment()` from `tests/001-project-foundation/test-utils.tsx` for component tests needing an isolated environment.
- For static boundary tests, read target source files using `fs.readFileSync` and assert absence of forbidden tokens or imports.
- Mark node-specific test suites with `/** @jest-environment node */` at the top of the file when browser DOM is not required.

---

## 10. SpecKit Feature Development Workflow

SearchTrace follows the **SpecKit** methodology for structured feature delivery:

```
specs/00X-<feature-name>/
├── spec.md                   # User stories, personas, and acceptance criteria
├── plan.md                   # Architecture plan, technical decisions, and structure
├── data-model.md             # Entities, database tables, and schema invariants
├── contracts/                # API, UI, or service contracts
├── checklists/               # Requirements checklists and quality gates
├── tasks.md                  # Granular, dependency-ordered task breakdown
└── quickstart.md             # Verification walkthrough & test instructions
```

When implementing a feature:
1. Review the relevant feature folder in `specs/`.
2. Follow the contracts and tasks defined in `tasks.md`.
3. Verify that changes fulfill the checklists and pass `bun run check`.

---

## 11. Coding Standards & PR Checklist

Before completing changes or opening a Pull Request:

- [ ] **Run Quality Gate**: `bun run check` exits with code 0 (all lint, types, and tests pass).
- [ ] **No Server Leaks**: Server-only modules contain `import "server-only";` and are not imported into client files.
- [ ] **TypeScript Strictness**: Code compiles without errors under `tsc --noEmit`. No untyped `any` usage.
- [ ] **Path Aliases**: Always use `@/*` for internal project imports (configured in `tsconfig.json`).
- [ ] **Accessibility**: No duplicate `<main>` landmarks; accessible names on all buttons and inputs; axe checks pass.
- [ ] **Error Safety**: tRPC procedures redact sensitive internals and use `unavailableResource()` for private records.
- [ ] **No Uncommitted Next.js Marker Diff**: Ensure the `<!-- BEGIN:nextjs-agent-rules -->` block at the top of `AGENTS.md` remains intact.
