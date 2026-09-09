# API Contract: Opportunity Evidence-Gap Analysis (`analysisRouter`)

**Feature**: Opportunity Evidence-Gap Analysis  
**Branch**: `010-evidence-gap-analysis`  
**Date**: 2026-09-09  
**Spec**: [spec.md](../spec.md)

---

## 1. Overview

The `analysisRouter` is mounted at `analysis` on the root tRPC `appRouter` (`trpc/routers/_app.ts`). All procedures are `protectedProcedure` calls requiring an authenticated user session (`ctx.session` and `ctx.actorId`).

### Core Security & Invariant Rules
1. **Strict Ownership Verification**: Every procedure checks that the caller owns the target `opportunityId`. If missing or owned by another user, the server throws `unavailableResource()` (404 NOT_FOUND).
2. **Authorized Inputs Only**: The analysis pipeline receives strictly:
   - Stored job description text.
   - User-reviewed résumé text (only when `extractionState === 'ready'` and `aiOptIn === true`).
   - Reusable evidence items linked via `opportunity_evidence` (unselected items in library are excluded).
   - Employer feedback items on the opportunity where `aiOptIn === true` (un-opted items are excluded).
3. **Draft Separation**: Running an analysis (`analysis.run`) produces an uncommitted draft and DOES NOT mutate database records. The assessment is persisted only when `analysis.save` is invoked.
4. **Rate Limiting**: Daily limit of 5 requests per user per calendar day (UTC) tracked under action `"evidence_gap_analysis"`.

---

## 2. Procedures Inventory

| Procedure | Type | Input Schema | Output Type | Description |
|---|:---:|---|---|---|
| `getPreFlight` | Query | `GetAnalysisPreFlightInput` | `AnalysisPreFlightResponse` | Validates prerequisites (requirements count, résumé readiness, AI opt-in, evidence counts, daily quota). |
| `run` | Mutation | `RunAnalysisInput` | `RunAnalysisResponse` | Invokes AI service, verifies verbatim citations, checks daily limits, and returns uncommitted draft analysis. |
| `save` | Mutation | `SaveAnalysisInput` | `SaveAnalysisResponse` | Persists user-confirmed coverage states, citations, limitations, and the next action to the database. |
| `getSummary` | Query | `GetAnalysisSummaryInput` | `AnalysisSummaryResponse` | Retrieves saved coverage counts, confirmed requirements, next action, and limitations for an opportunity. |
| `getDailyUsage` | Query | `void` | `DailyUsageResponse` | Introspects remaining daily analysis quota and reset timestamp for caller. |

---

## 3. Procedure Specifications

### 3.1 `analysis.getPreFlight`

- **Purpose**: Pre-flight inspection of an opportunity to verify whether evidence-gap analysis can be triggered, and summarize included source materials for user transparency.
- **Input Schema**:
  ```typescript
  export const getAnalysisPreFlightInputSchema = z.object({
    opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
  });
  ```
- **Output Schema**:
  ```typescript
  export const analysisPreFlightResponseSchema = z.object({
    isReady: z.boolean(),
    reasons: z.array(z.string()),
    requirementsCount: z.number().int().min(0),
    resumeStatus: z.object({
      exists: z.boolean(),
      extractionState: z.enum(["pending", "ready", "failed"]).nullable(),
      aiOptIn: z.boolean(),
    }),
    selectedEvidenceCount: z.number().int().min(0),
    selectedEvidenceTitles: z.array(z.string()),
    optedInFeedbackCount: z.number().int().min(0),
    dailyUsage: z.object({
      used: z.number().int().min(0),
      limit: z.number().int().min(1),
      remaining: z.number().int().min(0),
      resetsAt: z.string(),
    }),
  });
  ```

---

### 3.2 `analysis.run`

- **Purpose**: Executes the structured evidence-gap evaluation via Vercel AI SDK and Gemini 3.6 Flash (or mock), validates verbatim citations server-side, increments daily usage, and returns a reviewable draft.
- **Input Schema**:
  ```typescript
  export const runAnalysisInputSchema = z.object({
    opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
  });
  ```
- **Output Schema**:
  ```typescript
  export const requirementEvaluationDraftSchema = z.object({
    requirementId: z.string().min(1),
    requirementTitle: z.string().min(1),
    category: requirementCategoryEnum,
    jobDescriptionExcerpt: z.string().min(1),
    coverageState: coverageStateEnum,
    citationSource: citationSourceEnum.optional(),
    citationExcerpt: z.string().optional(),
    citationSourceTitle: z.string().optional(),
    missingEvidenceNotes: z.string().optional(),
    coverageRationale: z.string().optional(),
  });

  export const nextActionDraftSchema = z.object({
    text: z.string().min(10).max(500),
    targetRequirementId: z.string().optional(),
    targetRequirementTitle: z.string().optional(),
  });

  export const runAnalysisResponseSchema = z.object({
    opportunityId: z.string(),
    evaluations: z.array(requirementEvaluationDraftSchema),
    nextAction: nextActionDraftSchema,
    limitations: z.string(),
    summaryCounts: z.object({
      supported: z.number().int().min(0),
      weak: z.number().int().min(0),
      missing: z.number().int().min(0),
      unknown: z.number().int().min(0),
      total: z.number().int().min(1),
    }),
    dailyUsage: dailyUsageResponseSchema,
  });
  ```
- **Failure Modes**:
  - `BAD_REQUEST`: Fewer than 1 requirement, résumé not ready, or résumé AI opt-in disabled.
  - `TOO_MANY_REQUESTS`: Daily quota of 5 analysis operations exceeded.
  - `INTERNAL_SERVER_ERROR`: Provider timeout, schema validation error, or citation verification failure.

---

### 3.3 `analysis.save`

- **Purpose**: Persists the user-confirmed assessment results. Updates requirement coverage states and citations in `requirements`, updates `lastAnalyzedAt`, `nextActionText`, `nextActionRequirementId`, and `analysisLimitations` on `opportunities`.
- **Input Schema**:
  ```typescript
  export const confirmedRequirementItemSchema = z.object({
    id: z.string().min(1),
    coverageState: coverageStateEnum,
    citationSource: citationSourceEnum.optional().nullable(),
    citationExcerpt: z.string().max(1000).optional().nullable(),
    citationSourceTitle: z.string().max(200).optional().nullable(),
    missingEvidenceNotes: z.string().max(1000).optional().nullable(),
    coverageRationale: z.string().max(1000).optional().nullable(),
  });

  export const saveAnalysisInputSchema = z.object({
    opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
    requirements: z
      .array(confirmedRequirementItemSchema)
      .min(1, "At least one requirement must be provided"),
    nextAction: z.object({
      text: z.string().trim().min(10, "Next action must be at least 10 characters").max(500),
      targetRequirementId: z.string().optional().nullable(),
    }),
    limitations: z.string().trim().max(2000).optional().nullable(),
  });
  ```
- **Output Schema**:
  ```typescript
  export const saveAnalysisResponseSchema = z.object({
    success: z.literal(true),
    opportunityId: z.string(),
    lastAnalyzedAt: z.string(),
    summaryCounts: z.object({
      supported: z.number().int().min(0),
      weak: z.number().int().min(0),
      missing: z.number().int().min(0),
      unknown: z.number().int().min(0),
      total: z.number().int().min(1),
    }),
  });
  ```

---

### 3.4 `analysis.getSummary`

- **Purpose**: Retrieves the saved evidence-gap analysis status for an opportunity, including deterministic coverage counts, confirmed requirement statuses, and the single next action.
- **Input Schema**:
  ```typescript
  export const getAnalysisSummaryInputSchema = z.object({
    opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
  });
  ```
- **Output Schema**:
  ```typescript
  export const analysisSummaryResponseSchema = z.object({
    isAnalyzed: z.boolean(),
    lastAnalyzedAt: z.string().nullable(),
    summaryCounts: z.object({
      supported: z.number().int().min(0),
      weak: z.number().int().min(0),
      missing: z.number().int().min(0),
      unknown: z.number().int().min(0),
      total: z.number().int().min(0),
    }),
    nextAction: z
      .object({
        text: z.string(),
        targetRequirementId: z.string().nullable(),
        targetRequirementTitle: z.string().nullable(),
      })
      .nullable(),
    limitations: z.string().nullable(),
    requirements: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: requirementCategoryEnum,
        jobDescriptionExcerpt: z.string(),
        coverageState: coverageStateEnum.nullable(),
        citationSource: citationSourceEnum.nullable(),
        citationExcerpt: z.string().nullable(),
        citationSourceTitle: z.string().nullable(),
        missingEvidenceNotes: z.string().nullable(),
        coverageRationale: z.string().nullable(),
      })
    ),
  });
  ```
