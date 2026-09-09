/** @jest-environment node */

import { appRouter } from "@/trpc/routers/_app";
import { getDb } from "@/lib/db";
import { setAiAnalyzerService, InMemoryAiAnalyzer } from "@/lib/ai";
import { TRPCError } from "@trpc/server";

jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("@/lib/db", () => ({
  createDatabaseClient: jest.fn(() => ({
    db: {},
    close: jest.fn(),
  })),
  getDb: jest.fn(),
}));

jest.mock("@/lib/ai/rate-limiter", () => ({
  assertWithinDailyLimit: jest.fn(),
  getDailyUsage: jest.fn(),
  incrementDailyUsage: jest.fn(),
}));

import {
  assertWithinDailyLimit,
  getDailyUsage,
  incrementDailyUsage,
} from "@/lib/ai/rate-limiter";

describe("analysisRouter contract and procedures", () => {
  const authenticatedContext = {
    requestId: "test-req-id",
    session: {
      user: {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 3600000),
        token: "test-token",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    actorId: "user-123",
  };

  const unauthenticatedContext = {
    requestId: "test-req-id-anon",
    session: null,
    actorId: null,
  };

  const createAuthenticatedCaller = () =>
    appRouter.createCaller(authenticatedContext);
  const createUnauthenticatedCaller = () =>
    appRouter.createCaller(unauthenticatedContext);

  const sampleOpportunity = {
    id: "opp-0000-0000-0000-000000000001",
    userId: "user-123",
    company: "Acme Corp",
    role: "Senior Software Engineer",
    jobDescription: "Looking for an engineer with strong PostgreSQL, TypeScript, and Redis caching experience.",
    lastAnalyzedAt: null,
    nextActionText: null,
    nextActionRequirementId: null,
    analysisLimitations: null,
  };

  const sampleResume = {
    id: "res-0000-0000-0000-000000000001",
    opportunityId: "opp-0000-0000-0000-000000000001",
    userId: "user-123",
    extractionState: "ready",
    extractedText: "John Doe. Experienced in PostgreSQL relational modeling and Redis caching pipelines.",
    reviewedText: "John Doe. Experienced in PostgreSQL relational modeling and Redis caching pipelines.",
    aiOptIn: true,
  };

  const sampleRequirements = [
    {
      id: "req-0001",
      opportunityId: "opp-0000-0000-0000-000000000001",
      userId: "user-123",
      title: "Strong experience in PostgreSQL database design",
      category: "technical_skill" as const,
      jobDescriptionExcerpt: "strong PostgreSQL",
      orderIndex: 0,
      coverageState: null,
      citationSource: null,
      citationExcerpt: null,
      citationSourceTitle: null,
      missingEvidenceNotes: null,
      coverageRationale: null,
    },
    {
      id: "req-0002",
      opportunityId: "opp-0000-0000-0000-000000000001",
      userId: "user-123",
      title: "Kubernetes orchestration and container management",
      category: "experience" as const,
      jobDescriptionExcerpt: "Looking for an engineer",
      orderIndex: 1,
      coverageState: null,
      citationSource: null,
      citationExcerpt: null,
      citationSourceTitle: null,
      missingEvidenceNotes: null,
      coverageRationale: null,
    },
  ];

  let mockAnalyzer: InMemoryAiAnalyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalyzer = new InMemoryAiAnalyzer();
    setAiAnalyzerService(mockAnalyzer);

    (getDailyUsage as jest.Mock).mockResolvedValue({
      used: 0,
      limit: 5,
      remaining: 5,
      resetsAt: "2026-09-10T00:00:00.000Z",
    });

    (incrementDailyUsage as jest.Mock).mockResolvedValue({
      used: 1,
      limit: 5,
      remaining: 4,
      resetsAt: "2026-09-10T00:00:00.000Z",
    });

    (assertWithinDailyLimit as jest.Mock).mockResolvedValue(undefined);
  });

  afterAll(() => {
    setAiAnalyzerService(null);
  });

  describe("authentication checks", () => {
    it("rejects unauthenticated calls on analysis.getPreFlight", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.analysis.getPreFlight({ opportunityId: "opp-0001" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("rejects unauthenticated calls on analysis.run", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.analysis.run({ opportunityId: "opp-0001" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("rejects unauthenticated calls on analysis.save", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.analysis.save({
          opportunityId: "opp-0001",
          requirements: [{ id: "req-1", coverageState: "supported" }],
          nextAction: { text: "Some bounded action task" },
        })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("rejects unauthenticated calls on analysis.getSummary", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.analysis.getSummary({ opportunityId: "opp-0001" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("rejects unauthenticated calls on analysis.getDailyUsage", async () => {
      const client = createUnauthenticatedCaller();
      await expect(client.analysis.getDailyUsage()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("analysis.getPreFlight", () => {
    it("throws unavailableResource (404) if opportunity is missing or owned by another user", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.analysis.getPreFlight({ opportunityId: "opp-other" })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });

    it("returns isReady: false when opportunity has zero approved requirements", async () => {
      const mockSelect = jest.fn();
      // 1. Opportunity check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      // 2. Résumé check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleResume]),
        }),
      });
      // 3. Requirements check (empty)
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      // 4. Attached evidence check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      // 5. Opted-in feedback check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const res = await client.analysis.getPreFlight({
        opportunityId: sampleOpportunity.id,
      });

      expect(res.isReady).toBe(false);
      expect(res.reasons).toContain(
        "At least one approved requirement is required before running analysis."
      );
    });

    it("returns isReady: false when résumé AI opt-in is false", async () => {
      const mockSelect = jest.fn();
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ ...sampleResume, aiOptIn: false }]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(sampleRequirements),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const res = await client.analysis.getPreFlight({
        opportunityId: sampleOpportunity.id,
      });

      expect(res.isReady).toBe(false);
      expect(res.reasons).toContain(
        "AI opt-in consent must be enabled for the reviewed résumé."
      );
    });

    it("returns isReady: true with source summary when all prerequisites are satisfied", async () => {
      const mockSelect = jest.fn();
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleResume]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(sampleRequirements),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: "ev-1", title: "Project A" }]),
          }),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: "fb-1" }]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const res = await client.analysis.getPreFlight({
        opportunityId: sampleOpportunity.id,
      });

      expect(res.isReady).toBe(true);
      expect(res.reasons).toHaveLength(0);
      expect(res.requirementsCount).toBe(2);
      expect(res.resumeStatus.exists).toBe(true);
      expect(res.resumeStatus.aiOptIn).toBe(true);
      expect(res.selectedEvidenceCount).toBe(1);
      expect(res.selectedEvidenceTitles).toContain("Project A");
      expect(res.optedInFeedbackCount).toBe(1);
    });
  });

  describe("analysis.run", () => {
    it("throws BAD_REQUEST if résumé extraction is not ready", async () => {
      const mockSelect = jest.fn();
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ ...sampleResume, extractionState: "pending" }]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.analysis.run({ opportunityId: sampleOpportunity.id })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: "Reviewed résumé text must be in ready state to run analysis.",
      });
    });

    it("throws BAD_REQUEST if résumé AI opt-in is false", async () => {
      const mockSelect = jest.fn();
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ ...sampleResume, aiOptIn: false }]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.analysis.run({ opportunityId: sampleOpportunity.id })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: "Explicit AI opt-in consent is required for the reviewed résumé.",
      });
    });

    it("executes analysis, enforces daily rate limits, and returns uncommitted draft with summary counts", async () => {
      const mockSelect = jest.fn();
      // 1. Opp check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      // 2. Résumé check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleResume]),
        }),
      });
      // 3. Requirements check
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(sampleRequirements),
        }),
      });
      // 4. Attached evidence
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      // 5. Opted feedback
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const res = await client.analysis.run({
        opportunityId: sampleOpportunity.id,
      });

      expect(assertWithinDailyLimit).toHaveBeenCalledWith(
        "user-123",
        "evidence_gap_analysis"
      );
      expect(incrementDailyUsage).toHaveBeenCalledWith(
        "user-123",
        "evidence_gap_analysis"
      );

      expect(res.opportunityId).toBe(sampleOpportunity.id);
      expect(res.evaluations).toHaveLength(2);
      expect(res.nextAction).toBeDefined();
      expect(res.nextAction.text).toBeTruthy();
      expect(res.limitations).toBeTruthy();
      expect(res.summaryCounts.total).toBe(2);
    });

    it("rejects execution if daily quota limit is exhausted", async () => {
      (assertWithinDailyLimit as jest.Mock).mockRejectedValueOnce(
        new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Daily analysis limit reached (5 requests/day). Quota resets at UTC midnight.",
        })
      );

      const mockSelect = jest.fn();
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleResume]),
        }),
      });
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(sampleRequirements),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.analysis.run({ opportunityId: sampleOpportunity.id })
      ).rejects.toMatchObject({
        code: "TOO_MANY_REQUESTS",
      });
    });
  });

  describe("analysis.save", () => {
    it("persists confirmed coverage states and analysis columns", async () => {
      const mockSelect = jest.fn().mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([sampleOpportunity]),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      });

      const client = createAuthenticatedCaller();
      const res = await client.analysis.save({
        opportunityId: sampleOpportunity.id,
        requirements: [
          {
            id: "req-0001",
            coverageState: "supported",
            citationSource: "resume",
            citationExcerpt: "PostgreSQL relational modeling",
            citationSourceTitle: "Reviewed Résumé",
          },
          {
            id: "req-0002",
            coverageState: "missing",
            missingEvidenceNotes: "No Kubernetes experience found",
          },
        ],
        nextAction: {
          text: "Build a deployed containerized microservice demonstrating Kubernetes deployment.",
          targetRequirementId: "req-0002",
        },
        limitations: "Bounded solely by provided materials.",
      });

      expect(res.success).toBe(true);
      expect(res.opportunityId).toBe(sampleOpportunity.id);
      expect(res.summaryCounts.supported).toBe(1);
      expect(res.summaryCounts.missing).toBe(1);
      expect(res.summaryCounts.total).toBe(2);
      expect(mockUpdate).toHaveBeenCalledTimes(3); // 2 requirements + 1 opportunity
    });
  });

  describe("analysis.getSummary", () => {
    it("retrieves saved assessment and computes deterministic counts", async () => {
      const mockSelect = jest.fn();
      // 1. Opportunity
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              ...sampleOpportunity,
              lastAnalyzedAt: new Date("2026-09-09T10:00:00Z"),
              nextActionText: "Build a deployed project with Kubernetes.",
              nextActionRequirementId: "req-0002",
              analysisLimitations: "Evaluation bounded by supplied text.",
            },
          ]),
        }),
      });
      // 2. Requirements
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([
              {
                ...sampleRequirements[0],
                coverageState: "supported",
                citationSource: "resume",
                citationExcerpt: "PostgreSQL relational modeling",
              },
              {
                ...sampleRequirements[1],
                coverageState: "missing",
                missingEvidenceNotes: "Searched résumé, Kubernetes not found.",
              },
            ]),
          }),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const res = await client.analysis.getSummary({
        opportunityId: sampleOpportunity.id,
      });

      expect(res.isAnalyzed).toBe(true);
      expect(res.lastAnalyzedAt).toBeTruthy();
      expect(res.summaryCounts.supported).toBe(1);
      expect(res.summaryCounts.missing).toBe(1);
      expect(res.nextAction?.text).toBe("Build a deployed project with Kubernetes.");
      expect(res.nextAction?.targetRequirementTitle).toBe(
        "Kubernetes orchestration and container management"
      );
      expect(res.requirements).toHaveLength(2);
    });
  });

  describe("analysis.getDailyUsage", () => {
    it("returns remaining quota for caller", async () => {
      const client = createAuthenticatedCaller();
      const usage = await client.analysis.getDailyUsage();
      expect(usage.used).toBe(0);
      expect(usage.remaining).toBe(5);
      expect(getDailyUsage).toHaveBeenCalledWith(
        "user-123",
        "evidence_gap_analysis"
      );
    });
  });
});
