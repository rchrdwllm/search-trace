import "server-only";

import { TRPCError } from "@trpc/server";
import type { RequirementCategory } from "@/lib/validations/requirement";
import type {
  AiExtractorService,
  CandidateRequirement,
  ExtractRequirementsOptions,
  AiAnalyzerService,
  AnalyzeOpportunityEvidenceOptions,
  EvidenceGapAnalysisResult,
  AnalyzedRequirementEvaluation,
} from "./types";
import type { CoverageState, CitationSource } from "@/lib/validations/analysis";

/**
 * Deterministic in-memory AI extractor for offline testing and development.
 * Slices authentic verbatim sentences directly from the job description to guarantee
 * 100% citation verification without any network calls or API keys.
 */
export class InMemoryAiExtractor implements AiExtractorService {
  private shouldFail = false;
  private customRequirements?: CandidateRequirement[];

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  setCustomRequirements(reqs?: CandidateRequirement[]): void {
    this.customRequirements = reqs;
  }

  async extractRequirements(options: ExtractRequirementsOptions): Promise<CandidateRequirement[]> {
    if (this.shouldFail) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Simulated AI provider extraction failure.",
      });
    }

    if (this.customRequirements) {
      return [...this.customRequirements];
    }

    const { jobDescription } = options;
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Job description must be at least 50 characters to extract requirements.",
      });
    }

    // Split text into non-empty trimmed lines or sentences
    const segments = jobDescription
      .split(/\r?\n|(?<=[.!?])\s+/)
      .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
      .filter((s) => s.length >= 15 && s.length <= 300);

    const categories: RequirementCategory[] = [
      "technical_skill",
      "experience",
      "responsibility",
      "education",
      "other",
    ];

    const results: CandidateRequirement[] = [];

    for (let i = 0; i < segments.length && results.length < 8; i++) {
      const segment = segments[i];
      // Verify that this segment is actually in the original job description
      if (jobDescription.includes(segment)) {
        const category = categories[results.length % categories.length];
        results.push({
          title: segment.length > 80 ? segment.slice(0, 77) + "..." : segment,
          category,
          jobDescriptionExcerpt: segment,
          orderIndex: results.length,
        });
      }
    }

    // If fewer than 5 segments could be sliced cleanly, generate 5 verbatim chunks
    if (results.length < 5) {
      const cleanJd = jobDescription.trim();
      const chunkSize = Math.max(20, Math.floor(cleanJd.length / 6));

      for (let i = 0; i < 5; i++) {
        const start = i * chunkSize;
        const excerpt = cleanJd.slice(start, start + Math.min(chunkSize - 5, 80)).trim();
        if (excerpt.length >= 10 && cleanJd.includes(excerpt)) {
          results.push({
            title: `Requirement from job description section ${i + 1}`,
            category: categories[i % categories.length],
            jobDescriptionExcerpt: excerpt,
            orderIndex: results.length,
          });
        }
      }
    }

    return results.slice(0, 10);
  }
}

/**
 * Deterministic in-memory AI analyzer for offline testing and development.
 * Inspects approved requirements, reviewed résumé text, and selected supporting evidence,
 * slices authentic verbatim sentences to produce verified citations, assigns coverage states,
 * and proposes one bounded next action.
 */
export class InMemoryAiAnalyzer implements AiAnalyzerService {
  private shouldFail = false;
  private customResult?: EvidenceGapAnalysisResult;

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  setCustomResult(result?: EvidenceGapAnalysisResult): void {
    this.customResult = result;
  }

  async analyzeOpportunity(
    options: AnalyzeOpportunityEvidenceOptions
  ): Promise<EvidenceGapAnalysisResult> {
    if (this.shouldFail) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Simulated AI provider evidence-gap analysis failure.",
      });
    }

    if (this.customResult) {
      return { ...this.customResult };
    }

    const { requirements, resumeText, evidenceItems, feedbackItems } = options;

    if (!requirements || requirements.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "At least one approved requirement is required for evidence gap analysis.",
      });
    }

    const evaluations: AnalyzedRequirementEvaluation[] = [];

    // Helper: split text into authentic sentence chunks
    const toSentences = (text: string): string[] =>
      text
        .split(/\r?\n|(?<=[.!?])\s+/)
        .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
        .filter((s) => s.length >= 15);

    const resumeSentences = toSentences(resumeText || "");

    for (const req of requirements) {
      // Extract substantive keywords from requirement title
      const words = req.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(
          (w) =>
            w.length >= 4 &&
            ![
              "with",
              "from",
              "that",
              "this",
              "have",
              "must",
              "years",
              "experience",
              "senior",
              "engineer",
              "engineering",
              "software",
              "deep",
              "knowledge",
              "strong",
              "ability",
              "demonstrated",
            ].includes(w)
        );

      let matchedSentence: string | null = null;
      let citationSource: CitationSource | null = null;
      let citationSourceTitle: string | null = null;
      let coverageState: CoverageState = "missing";

      // 1. Search in résumé text
      for (const sentence of resumeSentences) {
        const sentenceLower = sentence.toLowerCase();
        const matchCount = words.filter((w) => sentenceLower.includes(w)).length;
        if (matchCount >= 2 && resumeText.includes(sentence)) {
          matchedSentence = sentence;
          citationSource = "resume";
          citationSourceTitle = "Reviewed Résumé";
          coverageState = "supported";
          break;
        } else if (matchCount === 1 && resumeText.includes(sentence) && !matchedSentence) {
          matchedSentence = sentence;
          citationSource = "resume";
          citationSourceTitle = "Reviewed Résumé";
          coverageState = "weak";
        }
      }

      // 2. Search in attached evidence items systematically (elevate weak/missing to supported)
      if (evidenceItems && evidenceItems.length > 0) {
        for (const ev of evidenceItems) {
          const titleLower = ev.title.toLowerCase();
          const titleMatch = words.filter((w) => titleLower.includes(w)).length;

          const evSentences = toSentences(ev.description);
          for (const s of evSentences) {
            const sLower = s.toLowerCase();
            const matchCount = words.filter((w) => sLower.includes(w)).length + (titleMatch > 0 ? 1 : 0);
            if (matchCount >= 2 && ev.description.includes(s)) {
              matchedSentence = s;
              citationSource = "evidence";
              citationSourceTitle = ev.title;
              coverageState = "supported";
              break;
            } else if (matchCount >= 1 && ev.description.includes(s) && coverageState === "missing") {
              matchedSentence = s;
              citationSource = "evidence";
              citationSourceTitle = ev.title;
              coverageState = "weak";
            }
          }
          if (coverageState === "supported" && citationSource === "evidence") break;
        }
      }

      // 3. Search in opted-in feedback items if still missing
      if (coverageState === "missing" && feedbackItems && feedbackItems.length > 0) {
        for (const fb of feedbackItems) {
          const fbSentences = toSentences(fb.text);
          for (const s of fbSentences) {
            const sLower = s.toLowerCase();
            const matchCount = words.filter((w) => sLower.includes(w)).length;
            if (matchCount >= 1 && fb.text.includes(s)) {
              matchedSentence = s;
              citationSource = "feedback";
              citationSourceTitle = "Employer Feedback";
              coverageState = "weak";
              break;
            }
          }
          if (coverageState !== "missing") break;
        }
      }

      // If requirement title contains words suggesting ambiguity, mark unknown
      if (req.title.toLowerCase().includes("ambiguous") || req.title.toLowerCase().includes("unknown")) {
        coverageState = "unknown";
        matchedSentence = null;
        citationSource = null;
        citationSourceTitle = null;
      }

      evaluations.push({
        requirementId: req.id,
        requirementTitle: req.title,
        category: req.category,
        jobDescriptionExcerpt: req.jobDescriptionExcerpt,
        coverageState,
        citationSource,
        citationSourceTitle,
        citationExcerpt: matchedSentence,
        missingEvidenceNotes:
          coverageState === "missing"
            ? `Searched candidate résumé and attached evidence, but no mention of "${req.title}" was found.`
            : null,
        coverageRationale:
          coverageState === "supported"
            ? "Candidate materials provide direct verifiable proof for this requirement."
            : coverageState === "weak"
            ? "Candidate materials demonstrate partial or introductory exposure, but lack depth."
            : coverageState === "unknown"
            ? "Candidate materials provide insufficient detail to make a conclusive determination."
            : "No evidence found across submitted materials.",
      });
    }

    // Determine exactly ONE next action
    // Priority: target first 'missing' requirement, or first 'weak', or first requirement
    const targetWeakOrMissing =
      evaluations.find((e) => e.coverageState === "missing") ||
      evaluations.find((e) => e.coverageState === "weak") ||
      evaluations[0];

    const nextAction = {
      text: targetWeakOrMissing.coverageState === "supported"
        ? `Prepare concrete architectural talking points demonstrating advanced expertise in ${targetWeakOrMissing.requirementTitle}.`
        : `Build and document a deployed project example demonstrating hands-on experience with ${targetWeakOrMissing.requirementTitle}.`,
      targetRequirementId: targetWeakOrMissing.requirementId,
      targetRequirementTitle: targetWeakOrMissing.requirementTitle,
    };

    const limitations =
      "Evaluation is strictly bounded by the submitted job description, reviewed résumé, attached supporting evidence, and opted-in feedback. It does not reflect external recruiter intent, subjective interview performance, or guarantee hiring outcomes.";

    return {
      evaluations,
      nextAction,
      limitations,
    };
  }
}
