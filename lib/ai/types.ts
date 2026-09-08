import "server-only";

import type { RequirementCategory } from "@/lib/validations/requirement";

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
