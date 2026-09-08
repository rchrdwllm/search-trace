/** @jest-environment node */

import { appRouter } from "@/trpc/routers/_app";
import { getDb } from "@/lib/db";
import { setAiExtractorService, InMemoryAiExtractor } from "@/lib/ai";

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

describe("requirementRouter contract and procedures", () => {
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

  const createAuthenticatedCaller = () => appRouter.createCaller(authenticatedContext);
  const createUnauthenticatedCaller = () => appRouter.createCaller(unauthenticatedContext);

  const sampleJobDescription = `
    Acme Software is seeking a Senior Full-Stack Engineer.
    Responsibilities include building and scaling modern cloud services.
    Qualifications require 5+ years of experience with TypeScript and React.
    Demonstrated track record with automated testing and continuous integration.
    Bachelor's degree in Computer Science or equivalent practical experience.
  `;

  let mockExtractor: InMemoryAiExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractor = new InMemoryAiExtractor();
    setAiExtractorService(mockExtractor);
  });

  afterAll(() => {
    setAiExtractorService(null);
  });

  describe("requirement.extract", () => {
    it("rejects unauthenticated calls", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.requirement.extract({ opportunityId: "a0000000-0000-0000-0000-000000000001" })
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("returns unavailableResource if opportunity does not exist or is not owned", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.requirement.extract({ opportunityId: "a0000000-0000-0000-0000-000000000001" })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("rejects job description that has less than 50 characters", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: "a0000000-0000-0000-0000-000000000001",
              userId: "user-123",
              jobDescription: "Short text",
            },
          ]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.requirement.extract({ opportunityId: "a0000000-0000-0000-0000-000000000001" })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("extracts draft requirements and increments usage on owned opportunity", async () => {
      // 1. Opportunity lookup
      // 2. Usage lookup (0 count)
      // 3. Upsert usage
      // 4. Final usage lookup (1 count)
      const mockSelect = jest
        .fn()
        // First call: opportunity query
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              {
                id: "a0000000-0000-0000-0000-000000000001",
                userId: "user-123",
                jobDescription: sampleJobDescription,
              },
            ]),
          }),
        })
        // Second call: check usage before extraction
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ count: 0 }]),
          }),
        })
        // Third call: get updated usage after increment
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ count: 1 }]),
          }),
        });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue({}),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const client = createAuthenticatedCaller();
      const result = await client.requirement.extract({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
      });

      expect(result.draftRequirements.length).toBeGreaterThanOrEqual(5);
      expect(result.dailyUsage.used).toBe(1);
      expect(result.draftRequirements[0]).toHaveProperty("tempId");
      expect(result.draftRequirements[0]).toHaveProperty("jobDescriptionExcerpt");
    });
  });

  describe("requirement.listByOpportunityId", () => {
    it("returns saved requirements for owned opportunity", async () => {
      const mockSelect = jest
        .fn()
        // Opp check
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: "a0000000-0000-0000-0000-000000000001" }]),
          }),
        })
        // Requirements query
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([
                {
                  id: "req-1",
                  title: "TypeScript expert",
                  category: "technical_skill",
                  jobDescriptionExcerpt: "5+ years of experience with TypeScript and React.",
                  orderIndex: 0,
                },
              ]),
            }),
          }),
        });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const list = await client.requirement.listByOpportunityId({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
      });

      expect(list).toHaveLength(1);
      expect(list[0].title).toBe("TypeScript expert");
    });
  });

  describe("requirement.save", () => {
    it("verifies citations and replaces saved requirements", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: "a0000000-0000-0000-0000-000000000001",
              jobDescription: sampleJobDescription,
            },
          ]),
        }),
      });

      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue({}),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
        insert: mockInsert,
      });

      const client = createAuthenticatedCaller();
      const res = await client.requirement.save({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
        requirements: [
          {
            title: "React & TypeScript skill",
            category: "technical_skill",
            jobDescriptionExcerpt: "5+ years of experience with TypeScript and React.",
            orderIndex: 0,
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it("rejects saving if any citation does not exist in job description", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: "a0000000-0000-0000-0000-000000000001",
              jobDescription: sampleJobDescription,
            },
          ]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.requirement.save({
          opportunityId: "a0000000-0000-0000-0000-000000000001",
          requirements: [
            {
              title: "Hallucinated item",
              category: "technical_skill",
              jobDescriptionExcerpt: "10+ years of Ruby on Rails and MongoDB",
              orderIndex: 0,
            },
          ],
        })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });
  });

  describe("requirement.delete", () => {
    it("deletes requirement when owned by user", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: "b0000000-0000-0000-0000-000000000001" }]),
        }),
      });

      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      });

      const client = createAuthenticatedCaller();
      const res = await client.requirement.delete({
        id: "b0000000-0000-0000-0000-000000000001",
      });

      expect(res.success).toBe(true);
      expect(res.deletedId).toBe("b0000000-0000-0000-0000-000000000001");
    });
  });
});
