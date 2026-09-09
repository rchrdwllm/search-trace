import { z } from "zod";
import { requirementCategoryEnum } from "./requirement";

export const coverageStateEnum = z.enum([
  "supported",
  "weak",
  "missing",
  "unknown",
]);

export type CoverageState = z.infer<typeof coverageStateEnum>;

export const coverageStateLabels: Record<CoverageState, string> = {
  supported: "Supported",
  weak: "Weak",
  missing: "Missing",
  unknown: "Unknown",
};

export const coverageStateDescriptions: Record<CoverageState, string> = {
  supported: "Direct, authentic proof found in candidate materials.",
  weak: "Relevant but partial, introductory, or indirect proof found.",
  missing: "Searched across submitted materials, but no relevant proof was found.",
  unknown: "Ambiguous, contradictory, or insufficient context to determine.",
};

export const citationSourceEnum = z.enum([
  "resume",
  "evidence",
  "feedback",
]);

export type CitationSource = z.infer<typeof citationSourceEnum>;

export const citationSourceLabels: Record<CitationSource, string> = {
  resume: "Reviewed Résumé",
  evidence: "Supporting Evidence",
  feedback: "Employer Feedback",
};

// ---------------------------------------------------------------------------
// Pre-Flight Schemas
// ---------------------------------------------------------------------------

export const getAnalysisPreFlightInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
});

export type GetAnalysisPreFlightInput = z.infer<typeof getAnalysisPreFlightInputSchema>;

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

export type AnalysisPreFlightResponse = z.infer<typeof analysisPreFlightResponseSchema>;

// ---------------------------------------------------------------------------
// Analysis Execution Schemas (Uncommitted Draft)
// ---------------------------------------------------------------------------

export const runAnalysisInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
});

export type RunAnalysisInput = z.infer<typeof runAnalysisInputSchema>;

export const requirementEvaluationDraftSchema = z.object({
  requirementId: z.string().min(1),
  requirementTitle: z.string().min(1),
  category: requirementCategoryEnum,
  jobDescriptionExcerpt: z.string().min(1),
  coverageState: coverageStateEnum,
  citationSource: citationSourceEnum.optional().nullable(),
  citationExcerpt: z.string().optional().nullable(),
  citationSourceTitle: z.string().optional().nullable(),
  missingEvidenceNotes: z.string().optional().nullable(),
  coverageRationale: z.string().optional().nullable(),
});

export type RequirementEvaluationDraft = z.infer<typeof requirementEvaluationDraftSchema>;

export const nextActionDraftSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, "Next action must be at least 10 characters")
    .max(500, "Next action cannot exceed 500 characters"),
  targetRequirementId: z.string().optional().nullable(),
  targetRequirementTitle: z.string().optional().nullable(),
});

export type NextActionDraft = z.infer<typeof nextActionDraftSchema>;

export const summaryCountsSchema = z.object({
  supported: z.number().int().min(0),
  weak: z.number().int().min(0),
  missing: z.number().int().min(0),
  unknown: z.number().int().min(0),
  total: z.number().int().min(0),
});

export type SummaryCounts = z.infer<typeof summaryCountsSchema>;

export const runAnalysisResponseSchema = z.object({
  opportunityId: z.string(),
  evaluations: z.array(requirementEvaluationDraftSchema),
  nextAction: nextActionDraftSchema,
  limitations: z.string(),
  summaryCounts: summaryCountsSchema,
  dailyUsage: z.object({
    used: z.number().int().min(0),
    limit: z.number().int().min(1),
    remaining: z.number().int().min(0),
    resetsAt: z.string(),
  }),
});

export type RunAnalysisResponse = z.infer<typeof runAnalysisResponseSchema>;

// ---------------------------------------------------------------------------
// AI Provider Structured Output Schema (used by Vercel AI SDK generateObject)
// ---------------------------------------------------------------------------

export const aiEvaluationItemSchema = z.object({
  requirementId: z.string().describe("ID of the requirement being evaluated"),
  coverageState: coverageStateEnum.describe(
    "Evaluation state: 'supported' if authentic proof exists, 'weak' if partial/indirect proof, 'missing' if evidence absent, 'unknown' if ambiguous"
  ),
  citationSource: citationSourceEnum
    .optional()
    .nullable()
    .describe("Source where proof was found: 'resume', 'evidence', or 'feedback' (required if supported or weak)"),
  citationExcerpt: z
    .string()
    .optional()
    .nullable()
    .describe("Exact verbatim quotation copied word-for-word from candidate materials evidencing this requirement"),
  citationSourceTitle: z
    .string()
    .optional()
    .nullable()
    .describe("Title or identifier of the cited source, e.g. 'Reviewed Résumé' or project title"),
  missingEvidenceNotes: z
    .string()
    .optional()
    .nullable()
    .describe("Specific qualification or proof that was searched for across candidate materials but not found"),
  coverageRationale: z
    .string()
    .optional()
    .nullable()
    .describe("Brief factual rationale explaining how the cited evidence (or lack thereof) leads to this decision"),
});

export const aiNextActionSchema = z.object({
  text: z
    .string()
    .describe(
      "Exactly one concrete, bounded improvement task (e.g. 'Build a deployed project demonstrating TypeScript and PostgreSQL') tied to a weak or missing requirement"
    ),
  targetRequirementId: z
    .string()
    .describe("ID of the specific weak or missing requirement targeted by this action"),
});

export const aiAnalysisOutputSchema = z.object({
  evaluations: z
    .array(aiEvaluationItemSchema)
    .describe("Array of evaluated requirements matching the input requirements list"),
  nextAction: aiNextActionSchema.describe("Exactly one bounded next action"),
  limitations: z
    .string()
    .describe(
      "Stated limitations and caveats detailing evaluation boundaries (e.g. bounded solely by submitted text; not a guarantee of recruiter decisions or interview outcomes)"
    ),
});

export type AiAnalysisOutput = z.infer<typeof aiAnalysisOutputSchema>;

// ---------------------------------------------------------------------------
// Persist Assessment Schemas
// ---------------------------------------------------------------------------

export const confirmedRequirementItemSchema = z.object({
  id: z.string().min(1, "Requirement identifier is required"),
  coverageState: coverageStateEnum,
  citationSource: citationSourceEnum.optional().nullable(),
  citationExcerpt: z.string().max(1000).optional().nullable(),
  citationSourceTitle: z.string().max(200).optional().nullable(),
  missingEvidenceNotes: z.string().max(1000).optional().nullable(),
  coverageRationale: z.string().max(1000).optional().nullable(),
});

export type ConfirmedRequirementItem = z.infer<typeof confirmedRequirementItemSchema>;

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

export type SaveAnalysisInput = z.infer<typeof saveAnalysisInputSchema>;

export const saveAnalysisResponseSchema = z.object({
  success: z.literal(true),
  opportunityId: z.string(),
  lastAnalyzedAt: z.string(),
  summaryCounts: summaryCountsSchema,
});

export type SaveAnalysisResponse = z.infer<typeof saveAnalysisResponseSchema>;

// ---------------------------------------------------------------------------
// Summary Query Schemas
// ---------------------------------------------------------------------------

export const getAnalysisSummaryInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
});

export type GetAnalysisSummaryInput = z.infer<typeof getAnalysisSummaryInputSchema>;

export const analysisSummaryResponseSchema = z.object({
  isAnalyzed: z.boolean(),
  lastAnalyzedAt: z.string().nullable(),
  summaryCounts: summaryCountsSchema,
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

export type AnalysisSummaryResponse = z.infer<typeof analysisSummaryResponseSchema>;
