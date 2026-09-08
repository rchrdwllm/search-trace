# Implementation Plan: Requirement Extraction from Job Description (Vercel AI SDK + Gemini 3.6 Flash)

**Branch**: `007-requirement-extraction` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-requirement-extraction/spec.md` (Story 5 — "Review an explainable evidence-gap analysis" phase 1: requirement extraction with exact job description citations from `docs/prd/prd.md`).

---

## Summary

Implement automated job requirement extraction from saved job descriptions using the **Vercel AI SDK** (`ai`, `@ai-sdk/google`) powered by **Google Gemini 3.6 Flash**, featuring server-side verbatim citation verification, a two-tier draft/persisted review workflow, human curation (edit, add, delete), daily quota enforcement (5 requests/user/day), and an offline-resilient quality gate. The feature introduces:

1. **AI SDK Framework & Model**: Integration of the Vercel AI SDK (`ai` and `@ai-sdk/google`) utilizing Google Gemini 3.6 Flash (`gemini-3.6-flash`) via `generateObject()` with direct Zod schema enforcement.
2. **AI SDK Skill**: Integration and installation of the official Vercel AI SDK skill via `bunx skills add https://github.com/vercel/ai --skill ai-sdk`.
3. **Documentation Updates**:
   - Update `docs/prd/prd.md` to explicitly name the Vercel AI SDK and Google Gemini 3.6 Flash under Working Stack and Section 3 (AI System Requirements).
   - Update `AGENTS.md` Technology Stack and AI Subsystems to document Vercel AI SDK (`ai`, `@ai-sdk/google`) and Gemini 3.6 Flash.
   - Update `.env.example` to document `GOOGLE_GENERATIVE_AI_API_KEY` / `GEMINI_API_KEY`, `GEMINI_MODEL`, and `AI_PROVIDER`.
4. **Schema & Persistence**: Typed `requirements` and `user_daily_usage` tables in Drizzle ORM scoped to the authenticated user and parent opportunity, with Drizzle migration `0003_add_requirements.sql`.
5. **Offline Test Resilience**: `InMemoryAiExtractor` (and Vercel AI SDK mock support) ensuring that the zero-credential offline quality gate (`bun run check`) and Jest unit tests pass completely offline without network calls or API keys.
6. **Citation Verification Pipeline**: Deterministic server-side validator in `lib/extraction/citation-verifier.ts` asserting that every cited excerpt is an exact, unhallucinated substring from the opportunity's job description.
7. **Rate Limiter**: Server-side rate limiter in `lib/ai/rate-limiter.ts` enforcing the constitutional 5 requests per day limit per user with UTC midnight reset.
8. **tRPC Router**: Typed `requirementRouter` in `trpc/routers/requirement.ts` with 5 protected procedures (`extract`, `listByOpportunityId`, `save`, `delete`, `getDailyUsage`) enforcing non-enumeration and ownership boundaries.
9. **Accessible UI**: Interactive curation workspace under `components/requirements/` integrated into the opportunity detail view (`/dashboard/opportunities/[opportunityId]`), supporting uncommitted draft review, modal editing, manual additions, and re-extraction confirmation.

---

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2.8, Next.js 16.3.4 (App Router), Bun 1.4.2

**Primary Dependencies**: Vercel AI SDK (`ai`), Google AI SDK Provider (`@ai-sdk/google`), tRPC v11, SuperJSON, TanStack React Query v5, Zod 4.1.12, Better Auth 1.7.3, Drizzle ORM 0.45.2, Lucide React, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`), Tailwind CSS v4

**Storage**: PostgreSQL hosted on Supabase; `requirements` and `user_daily_usage` tables managed via server-only Drizzle connections, with cascading foreign keys to `opportunities.id` and `user.id`. PGlite in-memory database harness for offline test execution.

**Testing**: Jest 30 with `--experimental-vm-modules`, React Testing Library, `jest-axe`, PGlite in-memory database test harness, fixture-based mock AI extractor provider (`InMemoryAiExtractor`), and static boundary assertions.

**Target Platform**: Node.js 20+ serverless hosting (Vercel) and modern evergreen browsers across responsive widths (320px to 1440px).

**Project Type**: Full-stack Next.js App Router application.

**Performance Goals**:
- Automated requirement extraction with Vercel AI SDK and Gemini 3.6 Flash completes in under 5 seconds for standard job descriptions.
- Server-side citation verification completes in under 10ms.
- Saved requirement mutations and query procedures respond in under 150ms.
- UI draft curation interactions render without visible latency.

**Constraints**:
- **Framework & Model**: Vercel AI SDK (`ai`) with Google Gemini 3.6 Flash (`@ai-sdk/google`, model `gemini-3.6-flash`).
- **Verbatim Citations**: 100% of extracted requirements must cite an exact excerpt from the job description (Constitution Principle I).
- **Human Control**: AI output is strictly a reviewable draft; only confirmed requirements are saved to the database (Constitution Principle II).
- **Rate Limit**: Server-enforced daily cap of 5 requests per user per day.
- **Privacy & Non-Enumeration**: Opportunities and requirements are private to owner; cross-user attempts return generic `unavailableResource()` (404 NOT_FOUND).
- **Zero Raw Logging**: Operational logs never record raw job descriptions, prompts, or model completions.
- **Safe Plain Text**: All requirement content is rendered as plain text (`whitespace-pre-wrap`) with zero script execution risk.

**Scale/Scope**: 1 Drizzle migration, 2 database tables, 5 tRPC procedures, 1 AI extractor service with 2 providers, 7 UI components, and a dedicated test suite in `tests/007-requirement-extraction/`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Constitutional Concern | Plan Response | Status |
|---|---|:---:|
| **I. Evidence Before Inference** | Every extracted requirement cites an exact excerpt from the job description. Server-side citation verifier validates substring match before user display or persistence. | Pass |
| **II. Human Review and Control** | AI output is uncommitted client draft. User can edit text, change category, adjust citation, add manual requirements, or delete requirements before saving. Re-extracting requires confirmation. | Pass |
| **III. Privacy, Isolation, and Explicit Consent** | Requirements are owner-scoped (`userId` FK). Cross-user access returns non-enumerating 404 `unavailableResource()`. Server logs exclude raw text and prompts. | Pass |
| **IV. Bounded and Honest AI** | Provider is bounded to extracting 5–12 requirements from supplied text via Vercel AI SDK `generateObject()`. No ATS scoring, outcome claims, or browsing. Provider/quota failures are explicit and retryable. | Pass |
| **V. Lean, Testable Delivery** | Bounded strictly to Story 5 requirement extraction; coverage matching deferred to next slice. Test directory in `tests/007-requirement-extraction/`. Offline quality gate supported via `InMemoryAiExtractor`. | Pass |

**Post-design review: PASS.**  
Design artifacts (`research.md`, `data-model.md`, `contracts/requirement-api.md`, `contracts/ai-extractor.md`, `contracts/requirement-ui.md`, `quickstart.md`) satisfy all constitutional principles and PRD requirements.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-requirement-extraction/
├── spec.md                                  # Feature specification
├── plan.md                                  # Implementation plan (this file)
├── research.md                              # Phase 0 decisions (Vercel AI SDK + Gemini 3.6 Flash)
├── data-model.md                            # Entity specifications and state transitions
├── quickstart.md                            # Runnable verification walkthrough
├── contracts/
│   ├── requirement-api.md                   # tRPC router procedures & Zod contracts
│   ├── ai-extractor.md                      # Vercel AI SDK prompt & schema contracts
│   └── requirement-ui.md                    # Component hierarchy & accessibility contracts
├── checklists/
│   └── requirements.md                      # Spec quality checklist
└── tasks.md                                 # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
docs/
└── prd/
    └── prd.md                               # [MODIFY] Update working stack & AI provider to Vercel AI SDK + Gemini 3.6 Flash

AGENTS.md                                    # [MODIFY] Update Tech Stack & AI Subsystems to document Vercel AI SDK & Gemini 3.6 Flash

.env.example                                 # [MODIFY] Add GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_MODEL, AI_PROVIDER

package.json                                 # [MODIFY] Add dependencies: ai, @ai-sdk/google

lib/
├── db/
│   └── schema.ts                            # [MODIFY] Add requirements and user_daily_usage tables
├── validations/
│   └── requirement.ts                       # [NEW] Zod schemas for requirements, categories, and inputs
├── extraction/
│   └── citation-verifier.ts                 # [NEW] Substring citation verification algorithm
└── ai/
    ├── types.ts                             # [NEW] AiExtractorService interface and result types
    ├── gemini.ts                            # [NEW] Vercel AI SDK + @ai-sdk/google client with generateObject()
    ├── mock.ts                              # [NEW] InMemoryAiExtractor for offline tests and dev
    ├── rate-limiter.ts                      # [NEW] Daily usage tracker and quota enforcement (5/day)
    └── index.ts                             # [NEW] AI provider factory (Vercel AI SDK vs InMemory fallback)

app/
└── dashboard/
    └── opportunities/
        └── [opportunityId]/
            └── page.tsx                     # [MODIFY] Embed RequirementSection below ResumeSection

trpc/routers/
├── _app.ts                                  # [MODIFY] Register requirementRouter
└── requirement.ts                           # [NEW] Domain router (extract, listByOpportunityId, save, delete, getDailyUsage)

components/
└── requirements/
    ├── requirement-section.tsx              # [NEW] Main coordinator component
    ├── requirement-card.tsx                 # [NEW] Individual requirement card with category badge & citation
    ├── requirement-draft-banner.tsx         # [NEW] Unsaved draft alert banner with Save & Discard buttons
    ├── requirement-edit-dialog.tsx          # [NEW] Accessible modal to edit title, category, citation
    ├── requirement-add-dialog.tsx           # [NEW] Accessible modal to create manual requirement
    ├── requirement-reextract-dialog.tsx     # [NEW] Replacement confirmation modal
    ├── requirement-quota-alert.tsx          # [NEW] Daily limit status and reset banner
    └── requirement-empty-state.tsx          # [NEW] Empty state with extract & add CTAs

drizzle/
├── 0003_add_requirements.sql                # [NEW] Generated migration SQL
└── meta/                                    # [MODIFY] Updated Drizzle migration snapshots

tests/007-requirement-extraction/
├── boundaries/
│   └── requirement-boundary.test.ts         # [NEW] Static boundaries & server-only import assertions
├── extraction/
│   └── citation-verifier.test.ts            # [NEW] Citation matching, whitespace normalization, hallucination tests
├── ai/
│   ├── gemini-extractor.test.ts             # [NEW] Vercel AI SDK generateObject tests with mock provider
│   └── rate-limiter.test.ts                 # [NEW] Daily quota checks, resets, and increment assertions
├── procedures/
│   └── requirement-router.test.ts           # [NEW] tRPC procedure contracts, authorization, & ownership checks
└── components/
    └── requirement-section.test.tsx         # [NEW] UI interactions, draft curation, and accessibility axe tests
```

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations. Design strictly adheres to all core principles and MVP constraints.*
