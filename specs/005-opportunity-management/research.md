# Research: Opportunity Management

## Decisions

### 1. Database Table and Schema Authority

**Decision**: Define the `opportunities` table in `lib/db/schema.ts` in the `public` schema, with foreign key `userId` referencing `user.id` (`onDelete: "cascade"`). Generate migrations via `bun run db:generate -- --name <name>`.

**Rationale**: Drizzle ORM is the sole schema authority in SearchTrace. Application tables reside in `public` Postgres schema with strict foreign keys to Better Auth's `user.id`. Better Auth table privileges are restricted; application queries connect via server-only Drizzle pool with owner-scoping.

**Alternatives considered**:
- *Supabase Dashboard UI creation*: Strictly prohibited by constitution and repository rules (no out-of-band schema changes).
- *`drizzle-kit push`*: Prohibited by project rules; migrations must be versioned and committed in `drizzle/`.

### 2. tRPC Procedure Architecture and Boundary Hygiene

**Decision**: Create a dedicated noun-named domain router `trpc/routers/opportunity.ts` and mount it under `opportunity` in `trpc/routers/_app.ts`. Implement five procedures:
- `opportunity.list`: Protected query returning opportunities for `ctx.actorId`, ordered by `updatedAt DESC`.
- `opportunity.byId`: Protected query returning single opportunity matching `id` and `ctx.actorId`. Throws `unavailableResource()` (HTTP 404 NOT_FOUND) if nonexistent or owned by another user.
- `opportunity.create`: Protected mutation accepting validated input, creating record scoped to `ctx.actorId`.
- `opportunity.update`: Protected mutation validating ownership via `ctx.actorId`, updating allowed fields. Throws `unavailableResource()` if nonexistent or foreign.
- `opportunity.delete`: Protected mutation validating ownership via `ctx.actorId`, deleting record. Throws `unavailableResource()` if nonexistent or foreign.

**Rationale**: Matches SearchTrace API conventions established in Specification 004. Enforces the sequential pipeline: Input Validation (Zod) → Authentication (`protectedProcedure`) → Authorization (`ctx.actorId` predicate) → Domain Effects. Uses `unavailableResource()` to satisfy non-enumeration invariants.

**Alternatives considered**:
- *Next.js Server Actions*: Specification 004 established tRPC v11 as the sole application API boundary; direct server actions for domain mutations are deprecated.
- *Returning HTTP 403 Forbidden*: Discloses the existence of another user's private opportunity, violating the non-enumeration requirement.

### 3. Validation Rules and Data Sanitization

**Decision**: Enforce strict Zod schemas for opportunity creation and updates:
- `company`: `z.string().trim().min(1, "Company name is required").max(100)`
- `role`: `z.string().trim().min(1, "Role title is required").max(100)`
- `jobDescription`: `z.string().trim().min(1, "Job description is required")`
- `sourceUrl`: optional, trimmed; if present, must be valid URL starting with `https://`
- `status`: `z.enum(["draft", "applied", "interviewing", "rejected", "closed"]).default("draft")`
Render all text content as plain text using CSS `whitespace-pre-wrap` to prevent script execution or markup interpretation.

**Rationale**: Fulfills FR-002, FR-003, FR-004, FR-005, FR-008, and FR-010. Rejecting non-HTTPS schemes protects users against malicious `javascript:` or insecure schemes. Plain text rendering satisfies the constitution's rendering safety constraints.

**Alternatives considered**:
- *Markdown / Rich Text rendering*: PRD and constitution explicitly require job descriptions and user content to be rendered as plain text to prevent XSS and preserve exact source text for downstream citations.
- *Permitting `http://`*: Job postings are on secure web destinations; enforcing HTTPS avoids insecure transports and mixed content warnings.

### 4. Client vs Server Component Consumption Pattern

**Decision**:
- Server Components (e.g., initial page load in `app/dashboard/page.tsx` and `app/dashboard/opportunities/[opportunityId]/page.tsx`) call `await getTRPCCaller()` from `trpc/server.tsx` to fetch data in-process without network overhead.
- Interactive components (opportunity forms, edit screens, delete confirmation dialog) use client components with `useTRPC()` hooks from `trpc/client.tsx` to handle mutations, loading states, and optimistic/invalidation updates through React Query.

**Rationale**: Follows the tRPC v11 + Next.js App Router hybrid architecture documented in `AGENTS.md`. Avoids self-fetching HTTP requests during SSR while providing responsive client-side form ergonomics and cache invalidation.

**Alternatives considered**:
- *Pure client-side fetching*: Results in client-side loading flashes (spinners) on primary landing pages.
- *Pure server components with form actions*: Lacks rich client-side field validation, interactive delete confirmations, and seamless optimistic updates.

### 5. Deletion UX and Safety

**Decision**: Implement deletion with an accessible confirmation dialog (`AlertDialog` / accessible modal). Deletion immediately invalidates the tRPC opportunity cache, redirects the user to `/dashboard`, and displays a polite status message.

**Rationale**: Fulfills FR-011 and FR-012, preventing accidental data loss while adhering to accessibility guidelines (no raw `window.confirm`).

**Alternatives considered**:
- *Browser `window.confirm`*: Inaccessible, cannot be styled or read reliably by screen readers, and inconsistent across browsers.
- *Soft-delete flag*: Not required by PRD; adds schema complexity without user value for MVP. Permanent deletion is clean and respects user control.

## Sources

- `AGENTS.md`: Sections 6.1 (tRPC API Layer), 6.2 (Database & Drizzle ORM), 7 (UI & Accessibility Standards)
- `.specify/memory/constitution.md`: Principles II (Human Review and Control), III (Privacy, Isolation), and V (Lean, Testable Delivery)
- `docs/prd/prd.md`: Section 2, Story 2 ("Capture one opportunity") and Section 4 (Core Data Model)
- Local codebase inspection of `trpc/init.ts`, `trpc/server.tsx`, and `lib/db/schema.ts`
