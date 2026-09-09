# Implementation Plan: Opportunity Evidence-Gap Analysis (Vercel AI SDK + Gemini 3.6 Flash)

**Branch**: `010-evidence-gap-analysis` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-evidence-gap-analysis/spec.md` (Primary Flow steps 6–8, Story 6 — "Review an explainable evidence-gap analysis" from `docs/prd/prd.md`).

---

## Summary

Implement explainable, multi-source **Evidence-Gap Analysis** for target job opportunities using the **Vercel AI SDK** (`ai`, `@ai-sdk/google`) powered by **Google Gemini 3.6 Flash** (`gemini-3.6-flash`), featuring server-side verbatim citation verification across candidate materials (reviewed résumé, attached evidence, opted-in feedback), a two-tier uncommitted draft review workflow, human curation and coverage overrides, stated limitations, exactly **one** bounded next action, daily quota enforcement (5 requests/user/day), and an offline-resilient quality gate. The feature delivers:

1. **AI Framework & Model**: Structured evaluation via `generateObject()` with Google Gemini 3.6 Flash and Zod schemas, enforcing coverage states (`supported`, `weak`, `missing`, `unknown`), source attribution, missing evidence identification, and one bounded next action.
2. **Deterministic Citation Verification**: Multi-source verbatim substring validator asserting that every cited excerpt for `supported` and `weak` requirements authentically exists in candidate-supplied text.
3. **Draft Separation & Human Control (Principle II)**: AI output is strictly an uncommitted client draft during review. Persistent database updates occur only when the user explicitly reviews, optionally overrides, and confirms the assessment.
4. **Data Model Alignment**: Nullable coverage and citation columns on `requirements`, and analysis summary columns (`last_analyzed_at`, `next_action_text`, `next_action_requirement_id`, `analysis_limitations`) on `opportunities` via Drizzle migration `0006_add_evidence_gap_analysis.sql`.
5. **Rate Limiting & Daily Quota**: Enforces the constitutional 5 requests per day limit per user with UTC midnight reset using existing `user_daily_usage` infrastructure under action `"evidence_gap_analysis"`.
6. **tRPC API Router**: Typed `analysisRouter` mounted at `analysis` in `trpc/routers/_app.ts` exposing `getPreFlight`, `run`, `save`, `getSummary`, and `getDailyUsage`.
7. **Accessible Opportunity UI**: Comprehensive workspace in `components/analysis/` integrated into the opportunity detail view (`/dashboard/opportunities/[opportunityId]`), supporting pre-flight source disclosure, interactive draft review, deterministic coverage summary counts, and a prominent Next Action card.
8. **Supporting Evidence Integration & Transparency**: Attached library items pass `sourceUrl` into the AI context and citation badges; AI prompt and mock systematically cross-reference proof items to elevate coverage states; UI displays evidence utilization count and external citation links.
9. **Offline Test Resilience**: `InMemoryAiAnalyzer` providing deterministic mock evaluations, ensuring that `bun run check` passes 100% offline with zero credentials.

---

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2.8, Next.js 16.3.4 (App Router), Bun 1.4.2

**Primary Dependencies**: Vercel AI SDK (`ai`), Google AI SDK Provider (`@ai-sdk/google`), tRPC v11, SuperJSON, TanStack React Query v5, Zod 4.1.12, Better Auth 1.7.3, Drizzle ORM 0.45.2, Lucide React, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-slot`), Tailwind CSS v4

**Storage**: PostgreSQL hosted on Supabase; `requirements` and `opportunities` tables updated via server-only Drizzle connections, with foreign key references and user ownership scoping. PGlite in-memory database test harness for offline tests.

**Testing**: Jest 30 with `--experimental-vm-modules`, React Testing Library, `jest-axe`, PGlite in-memory database harness, mock AI analyzer provider (`InMemoryAiAnalyzer`), and static boundary assertions.

**Target Platform**: Node.js 20+ serverless hosting (Vercel) and modern evergreen browsers across responsive widths (320px to 1440px).

**Project Type**: Full-stack Next.js App Router application.

**Performance Goals**:
- Automated evidence-gap evaluation via Vercel AI SDK and Gemini 3.6 Flash completes in under 10 seconds.
- Server-side multi-source citation verification completes in under 20ms.
- Saved assessment mutations and summary queries respond in under 150ms.
- UI draft curation and override interactions update with zero perceptible lag.

**Constraints**:
- **Model**: Google Gemini 3.6 Flash (`gemini-3.6-flash`) via Vercel AI SDK (`ai`, `@ai-sdk/google`).
- **Verbatim Citations**: 100% of `supported` and `weak` claims must cite an authentic excerpt from candidate-supplied materials (Constitution Principle I).
- **Human Control**: AI output is strictly an uncommitted draft; only confirmed assessments are saved (Constitution Principle II).
- **Single Next Action**: Exactly one bounded improvement task tied to a weak or missing requirement (Constitution Principle IV).
- **Rate Limit**: Server-enforced daily cap of 5 requests per user per day.
- **Privacy & Non-Enumeration**: Strictly single opportunity; cross-user attempts return generic `unavailableResource()` (404 NOT_FOUND).
- **Zero Raw Logging**: Operational logs never record raw résumés, job descriptions, evidence descriptions, feedback, prompts, or model outputs.
- **Safe Plain Text**: All user-authored and AI-generated text is rendered as plain text (`whitespace-pre-wrap`) with zero script execution risk.

**Scale/Scope**: 1 Drizzle migration, 2 enhanced database tables, 5 tRPC procedures, 1 AI analyzer service with 2 providers (Gemini & InMemory), 6 UI components, and a dedicated test suite in `tests/010-evidence-gap-analysis/`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design review: PASS.**

| Constitutional Principle | Implementation Plan Response | Status |
|---|---|:---:|
| **I. Evidence Before Inference** | Every `supported` or `weak` evaluation cites an exact verbatim excerpt from candidate-supplied materials (reviewed résumé, selected evidence, or opted-in feedback). Citation verifier validates substring match server-side. `missing` evaluations identify what was searched for but not found; ambiguous input results in `unknown`. | Pass |
| **II. Human Review and Control** | AI output is an uncommitted client draft. Candidate can review, change every coverage state, edit citation notes, and modify the next action before saving. Saved result is the true system of record. Re-running analysis preserves previous state if aborted or failed. | Pass |
| **III. Privacy, Isolation, and Explicit Consent** | Analysis is strictly scoped to one opportunity and its owner. Cross-user access returns generic 404 `unavailableResource()`. Pre-flight requires explicit résumé AI opt-in. Unselected library items and non-opted feedback are excluded. Operational logs exclude raw text. | Pass |
| **IV. Bounded and Honest AI** | Provider generates structured JSON validated server-side. AI evaluates only user-supplied evidence and proposes exactly ONE bounded next action tied to a weak or missing requirement. No ATS scores, hiring probabilities, or promises. Quota (5/day), timeout, and provider errors are explicit and retryable. | Pass |
| **V. Lean, Testable Delivery** | Directly completes Story 6 and Primary Flow steps 6–8 without introducing unrequested non-goals (no multi-opportunity CRM, no ATS calculators). Dedicated test suite in `tests/010-evidence-gap-analysis/`. Offline quality gate supported via `InMemoryAiAnalyzer`. | Pass |

**Post-design review: PASS.**  
Design artifacts (`research.md`, `data-model.md`, `contracts/analysis-api.md`, `contracts/ai-analyzer.md`, `contracts/analysis-ui.md`, `quickstart.md`) strictly adhere to all constitutional principles and PRD specifications.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-evidence-gap-analysis/
├── spec.md                                  # Feature specification
├── plan.md                                  # Implementation plan (this file)
├── research.md                              # Phase 0 decisions & architecture
├── data-model.md                            # Entity schema & state machine specifications
├── quickstart.md                            # Runnable verification walkthrough
├── contracts/
│   ├── analysis-api.md                      # tRPC router procedures & Zod contracts
│   ├── ai-analyzer.md                       # Vercel AI SDK prompt, schema & citation contracts
│   └── analysis-ui.md                       # Component hierarchy & accessibility contracts
├── checklists/
│   └── requirements.md                      # Spec quality checklist
└── tasks.md                                 # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
lib/
├── db/
│   └── schema.ts                            # Enhanced requirements & opportunities tables
├── validations/
│   └── analysis.ts                          # Shared Zod schemas for analysis input, output & drafts
├── ai/
│   ├── types.ts                             # AiAnalyzerService interfaces & types
│   ├── analyzer.ts                          # GeminiAiAnalyzer (Vercel AI SDK + Gemini 3.6 Flash)
│   ├── mock.ts                              # InMemoryAiAnalyzer for offline test resilience
│   └── index.ts                             # Factory getAiAnalyzerService()
└── extraction/
    └── citation-verifier.ts                 # Multi-source verbatim verification utility

drizzle/
└── 0006_add_evidence_gap_analysis.sql       # Drizzle migration for analysis columns

trpc/
└── routers/
    ├── analysis.ts                          # Typed analysis router (5 procedures)
    └── _app.ts                              # Mount analysis router at 'analysis'

components/
└── analysis/
    ├── analysis-section.tsx                 # Root coordinator component
    ├── analysis-preflight-dialog.tsx         # Pre-flight check & source disclosure modal
    ├── analysis-draft-review.tsx             # Interactive draft review workspace
    ├── analysis-coverage-summary.tsx         # Deterministic coverage count cards
    ├── analysis-next-action-card.tsx         # Dedicated Next Action recommendation card
    └── analysis-requirement-item.tsx         # Requirement card with coverage state & citations

app/
└── dashboard/
    └── opportunities/
        └── [opportunityId]/
            └── page.tsx                     # Integrated AnalysisSection on opportunity page

tests/010-evidence-gap-analysis/
├── boundaries/
│   └── analysis-boundary.test.ts            # Schema, RLS, and server-only boundary assertions
├── ai/
│   ├── citation-verifier.test.ts            # Verbatim citation verification tests
│   └── analyzer.test.ts                     # AI analyzer service & mock tests
├── procedures/
│   └── analysis-router.test.ts              # tRPC router procedure tests (ownership, quotas, flows)
└── components/
    └── analysis-views.test.tsx              # Component rendering, draft review & accessibility tests
```

---

## Complexity Tracking

> **No constitutional violations detected. Table intentionally empty.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | N/A |
