# Phase 0: Research & Architecture Decisions

**Feature**: Requirement Extraction from Job Description  
**Branch**: `007-requirement-extraction`  
**Date**: 2026-09-08  
**Spec**: [spec.md](./spec.md)

---

## 1. AI Integration: Vercel AI SDK with Google Gemini 3.6 Flash

### Context
The SearchTrace PRD specifies "one structured-output AI provider" that extracts 5–12 draft role requirements from a pasted job description, with strict server-side schema validation and verbatim citations. The user requested:
> "remember we're going to use Gemini model, but we'll use 3.6 Flash instead of 3.5 Flash. In your plan, include their to update the PRD to mention that and other relevant files as well."
> "update your plan again to mention that we're going to use the Vercel AI SDK. Plan to update the docs/prd/prd.md as well and include in your plan to install the AI SDK skill: `bunx skills add https://github.com/vercel/ai --skill ai-sdk`"

### Decision
1. **Framework & Provider**: Use the **Vercel AI SDK** (`ai`) with the official Google provider (`@ai-sdk/google`).
2. **Model**: Configure **Google Gemini 3.6 Flash** via `google("gemini-3.6-flash")` (or configurable model override via `GEMINI_MODEL`).
3. **Structured Output API**: Use Vercel AI SDK's `generateObject()` function paired directly with Zod schemas:
   ```typescript
   import { generateObject } from "ai";
   import { google } from "@ai-sdk/google";
   import { extractedRequirementsDraftSchema } from "@/lib/validations/requirement";

   const { object } = await generateObject({
     model: google("gemini-3.6-flash"),
     schema: extractedRequirementsDraftSchema,
     prompt: buildPrompt(jobDescription),
     temperature: 0.1,
   });
   ```
4. **Developer Skill**: Install the official Vercel AI SDK skill into the project using:
   ```powershell
   bunx skills add https://github.com/vercel/ai --skill ai-sdk
   ```
5. **Environment Configuration**:
   - Standard `@ai-sdk/google` environment variable: `GOOGLE_GENERATIVE_AI_API_KEY` (with support for alias `GEMINI_API_KEY`).
   - Provider selector: `AI_PROVIDER=google` or `AI_PROVIDER=memory`.
6. **Zero-Credential Offline Resilience (`bun run check`)**:
   - Define the `AiExtractorService` interface so that `InMemoryAiExtractor` handles offline test execution and development when API keys are absent or `AI_PROVIDER=memory`.
   - Vercel AI SDK also supports `MockLanguageModelV1`, allowing unit tests for `generateObject` calls without making outbound network requests.
7. **Documentation Updates**:
   - Update `docs/prd/prd.md` to explicitly specify Vercel AI SDK and Google Gemini 3.6 Flash under Working Stack and AI System Requirements.
   - Update `AGENTS.md` to document Vercel AI SDK (`ai`, `@ai-sdk/google`) and Gemini 3.6 Flash under Technology Stack and AI Subsystems.
   - Update `.env.example` with `GOOGLE_GENERATIVE_AI_API_KEY` / `GEMINI_API_KEY` and `AI_PROVIDER=google|memory`.

### Rationale
- **Standardization**: Vercel AI SDK is the industry-standard TypeScript abstraction for LLMs in Next.js applications, offering first-class TypeScript inference, unified error handling, and direct Zod schema parsing.
- **Provider Agnostic**: Using Vercel AI SDK insulates the codebase from underlying SDK quirks and simplifies provider switching if needed, while providing native support for Google Gemini models via `@ai-sdk/google`.
- **First-Class Zod Schema**: `generateObject` with Zod schemas automatically handles structured JSON generation and parsing, aligning perfectly with SearchTrace's strict schema validation requirement.

### Alternatives Considered
- *Direct `@google/genai` or `@google/generative-ai`*: Binds the application directly to Google's proprietary SDK interfaces without the standardized `generateObject` semantics and mock utilities provided by Vercel AI SDK.
- *OpenAI SDK*: Standard but superseded by the explicit architectural choice of Vercel AI SDK with Google Gemini 3.6 Flash.

---

## 2. Citation Verification Pipeline

### Context
Constitution Principle I (Evidence Before Inference) states:
> "Every extracted requirement MUST cite an exact excerpt from the supplied job description... The product MUST keep source material visibly distinct from AI interpretation and MUST NOT invent evidence."

### Decision
Implement server-side verbatim citation verification in `lib/extraction/citation-verifier.ts`:
1. Every candidate requirement produced by `generateObject()` must include `jobDescriptionExcerpt`.
2. The verifier checks whether `jobDescription.includes(excerpt)`.
3. To protect against superficial whitespace variations (Windows CRLF `\r\n` vs UNIX LF `\n`, non-breaking spaces, or consecutive space collapsing in LLM tokenization), the verifier performs:
   - Primary: Exact substring search: `jobDescription.includes(excerpt)`.
   - Secondary (whitespace-normalized): Compare normalized forms where consecutive whitespace is collapsed to single spaces: `normalize(jobDescription).includes(normalize(excerpt))`.
4. If a cited excerpt cannot be found in the job description, the requirement fails server validation. If the model hallucinates an excerpt, it is rejected and never presented to the user.

### Rationale
- LLMs can occasionally paraphrase or summarize even when instructed to quote verbatim. Programmatic server-side verification provides an absolute guarantee that no hallucinated citations reach the user or database.

---

## 3. Requirement Management Lifecycle (Draft vs. Persisted)

### Context
Constitution Principle II (Human Review and Control) states:
> "AI output MUST begin as a draft. Users MUST be able to review, edit, add, delete, accept, or reject requirements... before an assessment is saved."

### Decision
Use a two-tier lifecycle:
1. **Extraction (Draft Tier)**:
   - Calling `requirement.extract({ opportunityId })` calls the Vercel AI SDK extractor, verifies citations against the opportunity's job description, and returns the draft requirement array directly in the tRPC response.
   - The draft is held in client component state (TanStack Query / local state) and is visually badged with a "Draft (Unsaved)" banner.
   - Database records are completely untouched during extraction. If the request fails, network drops, or the user clicks "Discard", the database remains in its prior state with zero orphan or corrupt records.
2. **Review & Curation (Client Editing)**:
   - Users can edit requirement titles, change categories, edit citations (validated live), add custom manual requirements, or delete draft requirements.
3. **Persistence (Saved Tier)**:
   - When the user clicks "Save Requirements", the client submits the curated list via `requirement.save({ opportunityId, requirements })`.
   - The server re-validates all citations and categories, and atomically replaces/inserts the requirements in the `requirements` database table in a single Drizzle transaction.

---

## 4. Rate Limiting & Abuse Prevention

### Context
Constitution Product and Technical Constraints state:
> "The server MUST enforce a configurable per-user analysis limit; the initial default is five requests per day."

### Decision
Implement `lib/ai/rate-limiter.ts` using a dedicated Postgres table `user_daily_usage`:
- Columns: `id`, `userId`, `action` (e.g. `'requirement_extraction'`), `date` (`YYYY-MM-DD` string in UTC), `count` (integer), `createdAt`, `updatedAt`.
- Unique constraint: `(userId, action, date)`.
- Before executing an extraction request, check whether `count >= DAILY_LIMIT` (default 5).
- If exceeded, throw `TRPCError({ code: "TOO_MANY_REQUESTS", message: "Daily extraction limit reached (5/day). Resets at midnight UTC." })`.
- On successful extraction, atomically increment `count`.
- Provide a `requirement.getDailyUsage` query so the UI can display remaining requests to the user proactively.

---

## 5. Security, Authorization & Privacy Boundaries

### Context
Constitution Principle III states:
> "All user data MUST be private by default and scoped to its owner. Every user-owned database row MUST carry ownership information and be protected by row-level security; server operations MUST also verify opportunity ownership... operational logs MUST NOT contain raw résumés, job descriptions, feedback, prompts, or model output."

### Decision
1. **Ownership & Non-Enumeration**: Every procedure in `requirementRouter` verifies that `opportunity.userId === ctx.actorId`. If an opportunity does not exist or belongs to another user, throw `unavailableResource()` (HTTP 404 NOT_FOUND).
2. **Server-Only Isolation**: All AI client code, API keys, rate limiter queries, and citation verification code reside in `lib/ai/` with `import "server-only";` headers.
3. **Log Sanitization**: Error handlers and logging interceptors log only operation status, opportunity ID, error codes, and latency. Prompts, raw job descriptions, and model completions are strictly excluded from logs.
4. **Plain Text Rendering**: All requirement titles, categories, and citations are rendered using plain text elements (`p`, `span`) with `whitespace-pre-wrap` and no `dangerouslySetInnerHTML`.
