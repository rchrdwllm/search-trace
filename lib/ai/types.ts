import "server-only";

import type { RequirementCategory } from "@/lib/validations/requirement";
import type { CoverageState, CitationSource } from "@/lib/validations/analysis";

export interface CandidateRequirement {
  title: string;
  category: RequirementCategory;
  jobDescriptionExcerpt: string;
  orderIndex: number;
}

export interface ExtractRequirementsOptions {
  jobDescription: string;
}

export interface AiExtractorService {
  extractRequirements(options: ExtractRequirementsOptions): Promise<CandidateRequirement[]>;
}

// ---------------------------------------------------------------------------
// Evidence-Gap Analysis Types
// ---------------------------------------------------------------------------

export interface AnalyzedRequirementEvaluation {
  requirementId: string;
  requirementTitle: string;
  category: RequirementCategory;
  jobDescriptionExcerpt: string;
  coverageState: CoverageState;
  citationSource?: CitationSource | null;
  citationExcerpt?: string | null;
  citationSourceTitle?: string | null;
  missingEvidenceNotes?: string | null;
  coverageRationale?: string | null;
}

export interface AnalyzedNextAction {
  text: string;
  targetRequirementId?: string | null;
  targetRequirementTitle?: string | null;
}

export interface EvidenceGapAnalysisResult {
  evaluations: AnalyzedRequirementEvaluation[];
  nextAction: AnalyzedNextAction;
  limitations: string;
}

export interface AnalyzeOpportunityEvidenceOptions {
  opportunityId: string;
  jobDescription: string;
  requirements: Array<{
    id: string;
    title: string;
    category: RequirementCategory;
    jobDescriptionExcerpt: string;
  }>;
  resumeText: string;
  evidenceItems: Array<{
    id: string;
    title: string;
    description: string;
    type: "project" | "accomplishment" | "portfolio_link";
    sourceUrl?: string | null;
  }>;
  feedbackItems: Array<{
    id: string;
    feedbackDate: string;
    text: string;
    sourceType: string;
    provenance: "exact_quote" | "personal_summary";
  }>;
}

export interface AiAnalyzerService {
  analyzeOpportunity(
    options: AnalyzeOpportunityEvidenceOptions
  ): Promise<EvidenceGapAnalysisResult>;
}
