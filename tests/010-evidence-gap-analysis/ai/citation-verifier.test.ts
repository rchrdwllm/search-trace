/** @jest-environment node */
import {
  verifyCitation,
  verifyMultiSourceCitation,
} from "@/lib/extraction/citation-verifier";

describe("Multi-source citation verifier", () => {
  const resumeText = `
John Doe - Senior Software Engineer
Experience:
- Architected and scaled real-time messaging pipeline handling 50k events/sec using Node.js, Redis, and WebSockets.
- Designed distributed relational schema and migration strategy using PostgreSQL and Drizzle ORM.
- Spearheaded automated CI/CD deployment pipelines reducing release failure rate by 35%.
`;

  const evidenceItems = [
    {
      id: "ev-1",
      title: "Distributed Rate Limiter",
      description: "Implemented a sliding-window rate limiter using Redis and Lua scripts to throttle abusive requests.",
    },
    {
      id: "ev-2",
      title: "Search Trace Open Source",
      description: "Built an evidence-gap analyzer with strict privacy isolation and zero-credential offline testing.",
    },
  ];

  const feedbackItems = [
    {
      id: "fb-1",
      text: "Candidate demonstrated deep domain expertise in distributed caching and database indexing.",
    },
  ];

  describe("verifyCitation basic rules", () => {
    it("returns true for exact substring matches", () => {
      expect(
        verifyCitation(
          resumeText,
          "Architected and scaled real-time messaging pipeline"
        )
      ).toBe(true);
    });

    it("returns true for matches with varying whitespace/line breaks", () => {
      expect(
        verifyCitation(
          resumeText,
          "Architected   and  scaled \n real-time messaging pipeline"
        )
      ).toBe(true);
    });

    it("returns false for fabricated or hallucinated quotes", () => {
      expect(
        verifyCitation(
          resumeText,
          "Led a team of 50 Kubernetes DevOps engineers at Google"
        )
      ).toBe(false);
    });

    it("returns false for empty or whitespace-only inputs", () => {
      expect(verifyCitation(resumeText, "")).toBe(false);
      expect(verifyCitation(resumeText, "   \n\t ")).toBe(false);
      expect(verifyCitation("", "test")).toBe(false);
    });
  });

  describe("verifyMultiSourceCitation across candidate materials", () => {
    it("verifies citations sourced from reviewed résumé", () => {
      expect(
        verifyMultiSourceCitation(
          { resumeText, evidenceItems, feedbackItems },
          {
            source: "resume",
            excerpt: "PostgreSQL and Drizzle ORM",
          }
        )
      ).toBe(true);
    });

    it("verifies citations sourced from attached evidence items with matching sourceId", () => {
      expect(
        verifyMultiSourceCitation(
          { resumeText, evidenceItems, feedbackItems },
          {
            source: "evidence",
            sourceId: "ev-1",
            excerpt: "sliding-window rate limiter using Redis",
          }
        )
      ).toBe(true);
    });

    it("verifies citations sourced from evidence items across list when sourceId is omitted", () => {
      expect(
        verifyMultiSourceCitation(
          { resumeText, evidenceItems, feedbackItems },
          {
            source: "evidence",
            excerpt: "zero-credential offline testing",
          }
        )
      ).toBe(true);
    });

    it("verifies citations sourced from opted-in employer feedback", () => {
      expect(
        verifyMultiSourceCitation(
          { resumeText, evidenceItems, feedbackItems },
          {
            source: "feedback",
            sourceId: "fb-1",
            excerpt: "deep domain expertise in distributed caching",
          }
        )
      ).toBe(true);
    });

    it("rejects citation if source is 'resume' but excerpt only exists in evidence", () => {
      expect(
        verifyMultiSourceCitation(
          { resumeText, evidenceItems, feedbackItems },
          {
            source: "resume",
            excerpt: "sliding-window rate limiter",
          }
        )
      ).toBe(false);
    });

    it("rejects citation if source text is missing or null", () => {
      expect(
        verifyMultiSourceCitation(
          { resumeText: null, evidenceItems: [], feedbackItems: [] },
          {
            source: "resume",
            excerpt: "any excerpt",
          }
        )
      ).toBe(false);
    });
  });
});
