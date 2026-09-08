/** @jest-environment node */

import { InMemoryAiExtractor } from "@/lib/ai/mock";
import { GeminiAiExtractor } from "@/lib/ai/gemini";
import { getAiExtractorService, setAiExtractorService } from "@/lib/ai/index";
import { verifyCitation } from "@/lib/extraction/citation-verifier";
import { TRPCError } from "@trpc/server";

describe("AI Extractor Services", () => {
  const sampleJobDescription = `
    Acme Cloud Systems is looking for a Senior Staff Engineer.
    
    Job Responsibilities:
    - Architect and operate resilient multi-region cloud services on AWS and GCP.
    - Guide architectural decisions across five core engineering teams.
    - Lead incident reviews and continuously improve system availability.

    Basic Qualifications:
    - 7+ years of professional software engineering experience.
    - Deep expertise in TypeScript, Go, and distributed database systems.
    - Strong communication skills and experience mentoring engineers.
  `;

  afterEach(() => {
    setAiExtractorService(null);
  });

  describe("InMemoryAiExtractor", () => {
    let extractor: InMemoryAiExtractor;

    beforeEach(() => {
      extractor = new InMemoryAiExtractor();
    });

    it("extracts at least 5 requirements with verifiable verbatim citations", async () => {
      const requirements = await extractor.extractRequirements({
        jobDescription: sampleJobDescription,
      });

      expect(requirements.length).toBeGreaterThanOrEqual(5);
      expect(requirements.length).toBeLessThanOrEqual(12);

      for (const req of requirements) {
        expect(req.title.length).toBeGreaterThan(0);
        expect(["technical_skill", "experience", "education", "responsibility", "other"]).toContain(
          req.category
        );
        expect(verifyCitation(sampleJobDescription, req.jobDescriptionExcerpt)).toBe(true);
      }
    });

    it("rejects job descriptions that are under 50 characters", async () => {
      await expect(
        extractor.extractRequirements({ jobDescription: "Too short job description" })
      ).rejects.toThrow(TRPCError);
    });

    it("supports simulating an AI provider failure", async () => {
      extractor.setShouldFail(true);
      await expect(
        extractor.extractRequirements({ jobDescription: sampleJobDescription })
      ).rejects.toThrow(/Simulated AI provider extraction failure/);
    });

    it("supports returning preset custom requirements for fixture testing", async () => {
      const customReqs = [
        {
          title: "Custom Req 1",
          category: "technical_skill" as const,
          jobDescriptionExcerpt: "Deep expertise in TypeScript",
          orderIndex: 0,
        },
      ];
      extractor.setCustomRequirements(customReqs);

      const result = await extractor.extractRequirements({
        jobDescription: sampleJobDescription,
      });

      expect(result).toEqual(customReqs);
    });
  });

  describe("GeminiAiExtractor", () => {
    it("rejects job descriptions under 50 characters before calling API", async () => {
      const extractor = new GeminiAiExtractor("dummy-key", "gemini-3.6-flash");
      await expect(
        extractor.extractRequirements({ jobDescription: "Brief text" })
      ).rejects.toThrow(TRPCError);
    });

    it("throws INTERNAL_SERVER_ERROR if API key is not configured", async () => {
      const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const originalGeminiKey = process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      try {
        const extractor = new GeminiAiExtractor(undefined, "gemini-3.6-flash");
        await expect(
          extractor.extractRequirements({ jobDescription: sampleJobDescription })
        ).rejects.toMatchObject({
          code: "INTERNAL_SERVER_ERROR",
        });
      } finally {
        if (originalKey) process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
        if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
      }
    });
  });

  describe("getAiExtractorService factory", () => {
    it("defaults to InMemoryAiExtractor in test environment", () => {
      const service = getAiExtractorService();
      expect(service).toBeInstanceOf(InMemoryAiExtractor);
    });

    it("respects setAiExtractorService override", () => {
      const custom = new InMemoryAiExtractor();
      setAiExtractorService(custom);
      expect(getAiExtractorService()).toBe(custom);
    });
  });
});
