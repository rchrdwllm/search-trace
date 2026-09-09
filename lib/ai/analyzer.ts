import "server-only";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";
import {
  aiAnalysisOutputSchema,
  type CoverageState,
  type CitationSource,
} from "@/lib/validations/analysis";
import { verifyMultiSourceCitation } from "@/lib/extraction/citation-verifier";
import type {
  AiAnalyzerService,
  AnalyzeOpportunityEvidenceOptions,
  EvidenceGapAnalysisResult,
  AnalyzedRequirementEvaluation,
} from "./types";
import { DEFAULT_GEMINI_MODEL } from "./gemini";

export class GeminiAiAnalyzer implements AiAnalyzerService {
  private apiKey?: string;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey =
      apiKey ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY;
    this.modelName =
      modelName || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  }

  async analyzeOpportunity(
    options: AnalyzeOpportunityEvidenceOptions
  ): Promise<EvidenceGapAnalysisResult> {
    const {
      jobDescription,
      requirements,
      resumeText,
      evidenceItems,
      feedbackItems,
    } = options;

    if (!requirements || requirements.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "At least one approved requirement is required to run evidence-gap analysis.",
      });
    }

    const apiKey = this.apiKey;
    if (!apiKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Google Generative AI API key is not configured.",
      });
    }

    const googleProvider = createGoogleGenerativeAI({ apiKey });
    const model = googleProvider(this.modelName);

    // Format prompt sections
    const formattedRequirements = requirements
      .map(
        (r, i) =>
          `[REQ-${i + 1}] ID: "${r.id}" | Title: "${r.title}" | Category: ${r.category}\nJob Description Excerpt: "${r.jobDescriptionExcerpt}"`
      )
      .join("\n\n");

    const formattedEvidence =
      evidenceItems && evidenceItems.length > 0
        ? evidenceItems
            .map(
              (e, i) =>
                `[EVIDENCE-${i + 1}] ID: "${e.id}" | Title: "${e.title}" | Type: ${e.type}${e.sourceUrl ? ` | Link: ${e.sourceUrl}` : ""}\nDescription: ${e.description}`
            )
            .join("\n\n")
        : "(No additional supporting evidence items selected)";

    const formattedFeedback =
      feedbackItems && feedbackItems.length > 0
        ? feedbackItems
            .map(
              (f, i) =>
                `[FEEDBACK-${i + 1}] ID: "${f.id}" | Date: ${f.feedbackDate} | Source: ${f.sourceType} | Provenance: ${f.provenance}\nText: ${f.text}`
            )
            .join("\n\n")
        : "(No opted-in employer feedback provided)";

    try {
      const { object } = await generateObject({
        model,
        schema: aiAnalysisOutputSchema,
        temperature: 0.1,
        system: `You are an expert technical evidence-gap analyzer for software engineering roles.
Your task is to objectively evaluate approved role requirements against the candidate's supplied materials.

CORE EVALUATION PRINCIPLES:
1. EVIDENCE BEFORE INFERENCE: Every 'supported' or 'weak' coverage decision MUST cite an exact, authentic verbatim excerpt from the candidate's reviewed résumé, selected evidence, or opted-in feedback.
2. VERBATIM QUOTATIONS: Citation excerpts MUST be copied word-for-word from candidate materials without alteration, summarization, or synthesis.
3. CLEAR DETERMINATION RULES:
   - 'supported': Candidate materials contain clear, verifiable proof satisfying the requirement.
   - 'weak': Candidate materials contain relevant but partial, introductory, or indirect proof.
   - 'missing': Candidate materials were searched thoroughly and no relevant proof was found.
   - 'unknown': Candidate materials are ambiguous, contradictory, or insufficient to evaluate.
4. EVIDENCE CROSS-REFERENCING & PRIORITY:
   - Systematically evaluate attached evidence items (projects, accomplishments, portfolio links) alongside the candidate's résumé.
   - If a requirement is absent or only weakly demonstrated in the résumé, but proof is present in an attached evidence item, elevate the requirement's coverage state accordingly.
   - When an attached evidence item provides direct, tangible proof (e.g. a dedicated project, repository, or architecture accomplishment), prioritize citing that evidence item with citationSource: "evidence" and citationSourceTitle: e.g. "Project: " + title.
5. MISSING EVIDENCE NOTES: For every 'missing' requirement, explicitly state what specific evidence was sought across the submitted materials but not found.
6. BOUNDED NEXT ACTION: You MUST propose exactly ONE concrete, bounded improvement task (10–500 characters) tied to a weak or missing requirement (e.g., "Build a deployed project demonstrating TypeScript and PostgreSQL integration"). If all requirements are supported, propose an action to deepen practical demonstration of the highest-complexity requirement.
7. HONEST LIMITATIONS: Explicitly list the limitations and caveats of this evaluation (e.g. bounded solely by submitted text; not a guarantee of recruiter decisions or interview outcomes).
8. STRICT PROHIBITIONS:
   - NEVER calculate an ATS score, percentage match, or interview probability.
   - NEVER promise an offer or guarantee hiring success.
   - NEVER invent or synthesize evidence not present in the candidate's supplied text.`,
        prompt: `Evaluate these requirements against candidate materials:

=== JOB DESCRIPTION ===
${jobDescription}

=== APPROVED REQUIREMENTS TO EVALUATE ===
${formattedRequirements}

=== CANDIDATE REVIEWED RÉSUMÉ ===
${resumeText || "(No résumé text available)"}

=== CANDIDATE ATTACHED SUPPORTING EVIDENCE ===
${formattedEvidence}

=== CANDIDATE OPTED-IN EMPLOYER FEEDBACK ===
${formattedFeedback}`,
      });

      // Multi-source verification pipeline: Verify every citation against candidate sources
      const sources = {
        resumeText,
        evidenceItems,
        feedbackItems,
      };

      const reqMap = new Map(requirements.map((r) => [r.id, r]));
      const evaluations: AnalyzedRequirementEvaluation[] = [];

      for (const item of object.evaluations) {
        const req = reqMap.get(item.requirementId);
        if (!req) continue;

        let coverageState = item.coverageState as CoverageState;
        let citationSource: CitationSource | null = (item.citationSource as CitationSource) || null;
        let citationExcerpt = item.citationExcerpt ? item.citationExcerpt.trim() : null;
        const citationSourceTitle = item.citationSourceTitle || null;
        let missingEvidenceNotes = item.missingEvidenceNotes || null;
        let coverageRationale = item.coverageRationale || null;

        // Verify verbatim citation if supported or weak
        if (coverageState === "supported" || coverageState === "weak") {
          if (!citationSource || !citationExcerpt) {
            coverageState = "unknown";
            citationSource = null;
            citationExcerpt = null;
            coverageRationale = "Evidence claimed without verifiable citation; marked unknown.";
          } else {
            const isValid = verifyMultiSourceCitation(sources, {
              source: citationSource,
              excerpt: citationExcerpt,
            });

            if (!isValid) {
              // Citation verification failure: fall back to 'unknown' to preserve evidence integrity
              coverageState = "unknown";
              citationSource = null;
              citationExcerpt = null;
              coverageRationale = "AI citation could not be verified verbatim against candidate materials; marked unknown.";
            }
          }
        }

        if (coverageState === "missing" && !missingEvidenceNotes) {
          missingEvidenceNotes = `Searched candidate résumé and attached evidence, but no mention of "${req.title}" was found.`;
        }

        evaluations.push({
          requirementId: req.id,
          requirementTitle: req.title,
          category: req.category,
          jobDescriptionExcerpt: req.jobDescriptionExcerpt,
          coverageState,
          citationSource,
          citationExcerpt,
          citationSourceTitle,
          missingEvidenceNotes,
          coverageRationale,
        });
      }

      // If any requirement was omitted by the model, backfill with 'unknown'
      for (const req of requirements) {
        if (!evaluations.some((e) => e.requirementId === req.id)) {
          evaluations.push({
            requirementId: req.id,
            requirementTitle: req.title,
            category: req.category,
            jobDescriptionExcerpt: req.jobDescriptionExcerpt,
            coverageState: "unknown",
            citationSource: null,
            citationExcerpt: null,
            citationSourceTitle: null,
            missingEvidenceNotes: null,
            coverageRationale: "Requirement was not evaluated by the model; marked unknown.",
          });
        }
      }

      // Enforce that next action targets a weak or missing requirement if one exists
      const weakOrMissing = evaluations.filter(
        (e) => e.coverageState === "weak" || e.coverageState === "missing"
      );

      let nextActionTargetId = object.nextAction.targetRequirementId;
      let nextActionTargetTitle: string | null = null;

      if (weakOrMissing.length > 0) {
        const isTargetWeakOrMissing = weakOrMissing.some(
          (e) => e.requirementId === nextActionTargetId
        );
        if (!isTargetWeakOrMissing) {
          // Re-target to the first weak or missing requirement
          nextActionTargetId = weakOrMissing[0].requirementId;
          nextActionTargetTitle = weakOrMissing[0].requirementTitle;
        } else {
          const matched = evaluations.find((e) => e.requirementId === nextActionTargetId);
          nextActionTargetTitle = matched?.requirementTitle || null;
        }
      } else {
        const matched = evaluations.find((e) => e.requirementId === nextActionTargetId);
        nextActionTargetTitle = matched?.requirementTitle || evaluations[0]?.requirementTitle || null;
      }

      return {
        evaluations,
        nextAction: {
          text: object.nextAction.text.trim(),
          targetRequirementId: nextActionTargetId,
          targetRequirementTitle: nextActionTargetTitle,
        },
        limitations:
          object.limitations?.trim() ||
          "Evaluation is strictly bounded by the submitted job description, reviewed résumé, attached supporting evidence, and opted-in feedback. It does not reflect external recruiter intent or guarantee hiring outcomes.",
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to complete evidence-gap analysis. Please try again.",
        cause: error,
      });
    }
  }
}
