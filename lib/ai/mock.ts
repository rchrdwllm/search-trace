import "server-only";

import { TRPCError } from "@trpc/server";
import type { RequirementCategory } from "@/lib/validations/requirement";
import type { AiExtractorService, CandidateRequirement, ExtractRequirementsOptions } from "./types";

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
