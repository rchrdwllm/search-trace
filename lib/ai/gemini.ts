import "server-only";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";
import {
  extractedRequirementsDraftSchema,
  type RequirementCategory,
} from "@/lib/validations/requirement";
import { verifyCitation } from "@/lib/extraction/citation-verifier";
import type { AiExtractorService, CandidateRequirement, ExtractRequirementsOptions } from "./types";

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

export class GeminiAiExtractor implements AiExtractorService {
  private apiKey?: string;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    this.modelName = modelName || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  }

  async extractRequirements(options: ExtractRequirementsOptions): Promise<CandidateRequirement[]> {
    const { jobDescription } = options;

    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Job description must be at least 50 characters to extract requirements.",
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

    try {
      const { object } = await generateObject({
        model,
        schema: extractedRequirementsDraftSchema,
        temperature: 0.1,
        system: `You are an expert technical recruiter and evidence-gap analyzer for software engineering roles.
Your task is to analyze the provided job description and extract 5 to 12 distinct role requirements.

CRITICAL RULES:
1. Every requirement MUST be classified into exactly one category: 'technical_skill', 'experience', 'education', 'responsibility', or 'other'.
2. For EVERY requirement, you MUST provide an exact verbatim excerpt from the job description in 'jobDescriptionExcerpt'.
3. The excerpt MUST be copied word-for-word from the text. DO NOT paraphrase, summarize, or edit the quoted text.
4. Extract between 5 and 12 requirements. Prioritize substantive technical qualifications and core responsibilities.
5. NEVER invent requirements or citations not present in the supplied text.`,
        prompt: `Extract role requirements from this job description:\n\n--- BEGIN JOB DESCRIPTION ---\n${jobDescription}\n--- END JOB DESCRIPTION ---`,
      });

      // Server-side citation verification: Validate each excerpt is an exact verbatim substring
      const validRequirements: CandidateRequirement[] = [];

      for (let i = 0; i < object.requirements.length; i++) {
        const item = object.requirements[i];
        const isValid = verifyCitation(jobDescription, item.jobDescriptionExcerpt);

        if (isValid) {
          validRequirements.push({
            title: item.title,
            category: item.category as RequirementCategory,
            jobDescriptionExcerpt: item.jobDescriptionExcerpt.trim(),
            orderIndex: validRequirements.length,
          });
        }
      }

      if (validRequirements.length < 5) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to extract at least 5 verifiable requirements with authentic citations. Please check the job description and try again.",
        });
      }

      return validRequirements;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to extract requirements from job description. Please try again.",
        cause: error,
      });
    }
  }
}
