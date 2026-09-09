# Research & Architectural Decisions: Opportunity Evidence-Gap Analysis

**Feature**: Opportunity Evidence-Gap Analysis  
**Branch**: `010-evidence-gap-analysis`  
**Date**: 2026-09-09  
**Spec**: [spec.md](./spec.md)

---

## 1. Context & Objectives

The primary value proposition of SearchTrace is **explainable evidence-gap analysis**:
> "See which requirements your submitted evidence supports, where it is weak, and one concrete thing to improve before the next application."

This feature fulfills **PRD Primary Flow (steps 6–8)**, **User Story 6**, and **Constitution Principles I, II, III, IV, and V**. It compares user-approved role requirements against candidate-provided materials (reviewed résumé text, explicitly attached supporting evidence, and explicitly opted-in employer feedback) for a single opportunity. It generates:
1. Validated coverage states (`supported`, `weak`, `missing`, `unknown`) for each requirement.
2. Authentic verbatim citations from candidate materials for `supported` and `weak` evaluations.
3. Explicit identification of searched-but-missing proof for `missing` evaluations.
4. Stated assessment limitations and caveats.
5. Exactly **one** bounded next action tied to an identified weak or missing requirement.
6. An interactive human review workflow allowing overrides before persistence.
7. Strict rate limiting (5 requests/day), private ownership isolation, and offline test resilience.

---

## 2. Research Decisions & Alternatives

### Decision 1: AI Provider Architecture & Structured Output

- **Decision**: Extend the existing Vercel AI SDK (`ai` 7.x, `@ai-sdk/google` 4.x) integration using **Google Gemini 3.6 Flash** (`gemini-3.6-flash`) via `generateObject()` with a strict Zod output schema.
- **Rationale**: 
  - Standardized across the repository (established in `007-requirement-extraction`).
  - Native structured JSON output guarantees adherence to schema types, enums, and required fields.
  - Low latency (~2–4s) and high semantic reasoning capability for multi-document qualification matching.
  - In-memory mock fallback (`InMemoryAiAnalyzer`) satisfies the constitutional zero-credential offline quality gate (`bun run check`).
- **Alternatives Considered**:
  - *Free-form text generation with regex/JSON extraction*: Fragile, susceptible to formatting hallucinations and token bloat. Rejected.
  - *Multi-turn tool-calling agent*: Overly complex; introduces non-deterministic multi-step loops and latency. The task is a single-shot structured evaluation. Rejected.
  - *Local embeddings / vector search*: Overkill for single-opportunity analysis where total context (job description + résumé + evidence) fits comfortably within a single 1M-token prompt window. Rejected.

---

### Decision 2: Multi-Source Citation Attribution and Verification

- **Decision**: Structure AI evaluation citations with explicit source attribution (`source`: `'resume' | 'evidence' | 'feedback'`, `sourceId`: string, `sourceTitle`: string, `excerpt`: string), and verify each excerpt server-side using `verifyCitation` against the corresponding source text.
- **Rationale**:
  - **Constitution Principle I (Evidence Before Inference)** dictates that every `supported` and `weak` claim MUST cite an authentic excerpt from submitted facts.
  - Sourcing quotations to specific materials prevents confusing candidate project descriptions with résumé bullet points or feedback quotes.
  - Server-side verification ensures that model hallucinations (altered or synthesized quotes) are caught and rejected prior to displaying or persisting results.
- **Alternatives Considered**:
  - *Single concatenated text blob without source attribution*: Makes it impossible for users to discern where proof was found (e.g. distinguishing résumé from attached project). Rejected.
  - *Fuzzy matching or semantic similarity score*: Conceals uncertainty and permits plausible hallucinations. Verbatim substring matching ensures strict factual grounding. Rejected.

---

### Decision 3: Two-Tier Review Workflow (Client Draft vs Persisted State)

- **Decision**: AI analysis output is returned directly to the client as an uncommitted draft. Persistent database records (`requirements` coverage columns and `opportunities` analysis columns) are updated ONLY when the user explicitly reviews, adjusts, and confirms the assessment via `analysis.save`.
- **Rationale**:
  - **Constitution Principle II (Human Review and Control)** mandates: "AI output MUST begin as a draft. Users MUST be able to review, edit, add, delete, accept, or reject requirements and change every coverage state before an assessment is saved. User-confirmed records are the system of record."
  - Holding the draft in client state allows users to test changes, override coverage states, edit citation notes, adjust the next action, or discard the draft entirely without dirtying the database.
- **Alternatives Considered**:
  - *Immediately persist AI output to database and allow edits later*: Violates Principle II; uninspected AI guesses would become the system of record upon generation. Rejected.
  - *Save draft in a separate `analysis_drafts` table*: Unnecessary database complexity for temporary review state that can be managed in React state and discarded with zero database cleanup. Rejected.

---

### Decision 4: Database Schema Evolution & PRD Data Model Alignment

- **Decision**: 
  1. Add nullable coverage and citation columns to the existing `requirements` table:
     - `citation_source`: text (`resume`, `evidence`, `feedback`)
     - `citation_excerpt`: text (verbatim quote)
     - `citation_source_title`: text (e.g., "Reviewed Résumé", "Portfolio Project: Real-time API")
     - `missing_evidence_notes`: text (searched-but-missing details)
     - `coverage_rationale`: text (brief evaluation rationale)
  2. Add analysis summary columns to the existing `opportunities` table:
     - `last_analyzed_at`: timestamp with timezone
     - `next_action_text`: text (the single bounded improvement task)
     - `next_action_requirement_id`: text (referencing the targeted weak/missing requirement)
     - `analysis_limitations`: text (stated assessment boundaries and caveats)
  3. Create Drizzle migration `0006_add_evidence_gap_analysis.sql`.
- **Rationale**:
  - Exactly reflects PRD Core Data Model:
    - `opportunities`: "Owner, company, role, job description, optional URL, status, and analysis timestamp."
    - `requirements`: "User-approved requirement, category, job-description excerpt, coverage state, and rationale/citations."
  - Backwards-compatible: existing requirements and opportunities simply have `null` for these columns until an analysis is performed and saved.
  - Strictly adheres to the constitutional non-goal: "No events, diagnostic history, experiments, requirement-to-evidence join table, résumé-version library, or audit-log entity is required for the MVP."
- **Alternatives Considered**:
  - *Separate `assessments` or `analysis_runs` table*: Specifically listed in PRD Section 4 as a non-goal for the MVP ("No events, diagnostic history... audit-log entity is required"). Rejected.

---

### Decision 5: Bounded Next Action Design

- **Decision**: Require the AI model to produce exactly **one** next action, validate server-side that it references an identified weak or missing requirement (if any exist), and enforce via prompt and schema that it is framed as a concrete, achievable improvement task.
- **Rationale**:
  - Fulfills PRD Story 6 acceptance criteria and Constitution Principle IV: "propose exactly one practical action tied to a weak or missing requirement... never as a promise of an interview or offer."
  - Single action prevents candidate cognitive overload and establishes clear application priorities.
  - If 100% of requirements are supported, the action provides guidance on deepening demonstration or interview readiness for the highest-complexity requirement.
- **Alternatives Considered**:
  - *Top 3 next actions*: Violates PRD requirement for "exactly one bounded next action". Rejected.
  - *Free-floating advice not linked to a requirement*: Often devolves into generic fluff ("Network more", "Tailor your resume"). Tying to a weak/missing requirement ensures actionable evidence grounding. Rejected.

---

### Decision 6: Rate Limiting and Quota Architecture

- **Decision**: Utilize the existing `user_daily_usage` table and `assertWithinDailyLimit`/`incrementDailyUsage` utilities in `lib/ai/rate-limiter.ts` using the action identifier `"evidence_gap_analysis"`, enforcing the constitutional limit of 5 requests per user per UTC calendar day.
- **Rationale**:
  - Consistency with `requirement_extraction` usage tracking.
  - Prevents accidental token spend and ensures sustainable usage.
  - Atomic database check and increment ensures strict adherence with zero race-condition overages.
- **Alternatives Considered**:
  - *Client-side local storage counter*: Trivially bypassed and lost across devices. Rejected.
  - *Sliding window rate limiter*: Adds unnecessary complexity over standard UTC calendar day tracking. Rejected.

---

### Decision 7: Offline Test Harness & Quality Gate Resilience

- **Decision**: Implement `InMemoryAiAnalyzer` implementing `AiAnalyzerService` in `lib/ai/mock.ts`. The mock deterministically inspects the provided requirements, résumé, and evidence, matches keywords or sentences to produce authentic citations and coverage states, selects a weak or missing requirement, and creates a realistic bounded next action without external network calls or credentials.
- **Rationale**:
  - Fulfills the project-wide requirement that `bun run check` (Lint + Typecheck + Jest) passes 100% offline in zero-credential environments.
  - Enables comprehensive testing of citation verification, error states, and review flows in automated CI/CD.
- **Alternatives Considered**:
  - *Mocking fetch/HTTP requests directly*: Brittle and prone to breakage whenever AI SDK internals change. Service-level interface mocking is cleaner and more robust. Rejected.
