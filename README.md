# SearchTrace

SearchTrace is a private evidence-review product in development. This foundation release provides an accessible, service-independent application shell and honest placeholder states for later opportunity and résumé evidence workflows.

## Local development

Requirements: Node.js 20.9+, Bun 1.4.2 (or a compatible Bun release), and no Supabase account for the foundation checks.

```powershell
bun install --frozen-lockfile
bun run dev
```

The root page renders without `.env.local`. The committed [.env.example](.env.example) documents the only public Supabase variables reserved for a later integration feature. Copy it to `.env.local` only when exercising those factories locally; do not add secret or service-role keys.

## Verification

```powershell
bun run check          # lint, strict typecheck, one-shot Jest; offline
bun run test           # one-shot Jest
bun run test:coverage  # one-shot Jest with V8 coverage
bun run test:watch     # local watch mode
bun run build          # separate production compilation gate
```

The automated gate requires no network, credentials, live backend, or remote product data. To verify failure propagation, temporarily change a local assertion, run `bun run check`, observe the named nonzero failure, and restore the assertion without committing the intentional change.

Jest/jsdom verifies semantics, keyboard behavior, state communication, static boundaries, and axe results. It does not prove real CSS layout, responsive overflow, media-query appearance, visible focus-ring styling, or 200% zoom. Those checks belong in a browser using the repeatable widths 320, 375, 768, 1024, and 1440 CSS pixels, plus 200% zoom, keyboard navigation, mobile sidebar open/close, and system appearance changes.

## Scope boundaries

The shell intentionally does not provide authentication, route protection, persistence, database queries, storage, résumé extraction, AI analysis, or a functional opportunity workflow. The future navigation items are disabled and visibly described as unavailable. The shell and root layout do not import Supabase factories or perform remote calls.

The browser and server Supabase factories are isolated under `lib/supabase/`, validate public configuration lazily, and use only the publishable key. A later authentication feature must re-check current `@supabase/ssr` guidance before adding Proxy/cookie refresh behavior. A later data feature must add ownership checks, RLS, private storage, and cross-user authorization tests before queries are enabled.

## ShadCN provenance

The shell began with the mandated `@efferd/app-shell-4` registry block. Its provider, inset sidebar, collapsible navigation, header trigger, and padded main structure were retained; demo commerce, account, remote-avatar, notification, changelog, and fake-route content was removed. The full generated-versus-retained audit is recorded in [implementation-handoff.md](specs/001-project-foundation/implementation-handoff.md).
