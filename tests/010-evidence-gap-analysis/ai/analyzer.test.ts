/** @jest-environment node */
import { InMemoryAiAnalyzer } from "@/lib/ai/mock";
import { TRPCError } from "@trpc/server";

describe("InMemoryAiAnalyzer service", () => {
  const sampleOpportunity = {
    opportunityId: "opp-123",
    jobDescription: "Looking for a Senior Software Engineer with strong experience in PostgreSQL, TypeScript, and Redis caching.",
    requirements: [
      {
        id: "req-1",
        title: "Production experience with PostgreSQL and Drizzle ORM",
        category: "technical_skill" as const,
        jobDescriptionExcerpt: "strong experience in PostgreSQL",
      },
      {
        id: "req-2",
        title: "Hands-on experience building distributed rate limiters with Redis",
        category: "technical_skill" as const,
        jobDescriptionExcerpt: "Redis caching",
      },
      {
        id: "req-3",
        title: "Deep knowledge of Kubernetes cluster orchestration",
        category: "experience" as const,
        jobDescriptionExcerpt: "Looking for a Senior Software Engineer",
      },
    ],
    resumeText: `
John Doe - Senior Engineer
Experience:
- Designed relational database schemas and queries using PostgreSQL and Drizzle ORM.
- Spearheaded team engineering standards.
`,
    evidenceItems: [
      {
        id: "ev-1",
        title: "Redis Rate Limiter",
        description: "Implemented a sliding-window rate limiter with Redis and Lua scripts.",
        type: "project" as const,
        sourceUrl: "https://github.com/example/redis-limiter",
      },
    ],
    feedbackItems: [],
  };

  it("assigns supported coverage with verbatim citation when evidence is found in résumé", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    const result = await analyzer.analyzeOpportunity(sampleOpportunity);

    const postgresReq = result.evaluations.find((e) => e.requirementId === "req-1");
    expect(postgresReq).toBeDefined();
    expect(postgresReq?.coverageState).toBe("supported");
    expect(postgresReq?.citationSource).toBe("resume");
    expect(postgresReq?.citationSourceTitle).toBe("Reviewed Résumé");
    expect(postgresReq?.citationExcerpt).toContain("PostgreSQL and Drizzle ORM");
    expect(sampleOpportunity.resumeText).toContain(postgresReq?.citationExcerpt || "");
  });

  it("assigns coverage with verbatim citation when evidence is found in attached evidence items", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    const result = await analyzer.analyzeOpportunity(sampleOpportunity);

    const redisReq = result.evaluations.find((e) => e.requirementId === "req-2");
    expect(redisReq).toBeDefined();
    expect(redisReq?.coverageState).toBe("supported");
    expect(redisReq?.citationSource).toBe("evidence");
    expect(redisReq?.citationSourceTitle).toBe("Redis Rate Limiter");
    expect(redisReq?.citationExcerpt).toContain("Redis and Lua scripts");
    expect(sampleOpportunity.evidenceItems[0].description).toContain(redisReq?.citationExcerpt || "");
  });

  it("assigns missing state with searched-but-missing notes when requirement is not in materials", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    const result = await analyzer.analyzeOpportunity(sampleOpportunity);

    const k8sReq = result.evaluations.find((e) => e.requirementId === "req-3");
    expect(k8sReq).toBeDefined();
    expect(k8sReq?.coverageState).toBe("missing");
    expect(k8sReq?.citationExcerpt).toBeNull();
    expect(k8sReq?.missingEvidenceNotes).toContain("Kubernetes cluster orchestration");
  });

  it("produces exactly one next action referencing a weak or missing requirement", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    const result = await analyzer.analyzeOpportunity(sampleOpportunity);

    expect(result.nextAction).toBeDefined();
    expect(result.nextAction.text).toBeTruthy();
    expect(result.nextAction.targetRequirementId).toBe("req-3");
    expect(result.nextAction.targetRequirementTitle).toBe(
      "Deep knowledge of Kubernetes cluster orchestration"
    );
  });

  it("includes stated limitations detailing evaluation boundaries", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    const result = await analyzer.analyzeOpportunity(sampleOpportunity);

    expect(result.limitations).toBeTruthy();
    expect(result.limitations).toContain("strictly bounded by the submitted job description");
  });

  it("throws BAD_REQUEST if requirements list is empty", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    await expect(
      analyzer.analyzeOpportunity({
        ...sampleOpportunity,
        requirements: [],
      })
    ).rejects.toThrow(TRPCError);
  });

  it("handles simulated AI failure when shouldFail is set", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    analyzer.setShouldFail(true);

    await expect(analyzer.analyzeOpportunity(sampleOpportunity)).rejects.toThrow(
      "Simulated AI provider evidence-gap analysis failure."
    );
  });

  it("returns custom mock result when setCustomResult is provided", async () => {
    const analyzer = new InMemoryAiAnalyzer();
    analyzer.setCustomResult({
      evaluations: [],
      nextAction: { text: "Custom next action" },
      limitations: "Custom limitations",
    });

    const result = await analyzer.analyzeOpportunity(sampleOpportunity);
    expect(result.nextAction.text).toBe("Custom next action");
    expect(result.limitations).toBe("Custom limitations");
  });
});
