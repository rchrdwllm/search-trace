/** @jest-environment node */

import { appRouter } from "@/trpc/routers/_app";
import { getDb } from "@/lib/db";

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

describe("evidenceRouter contract and procedures", () => {
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

  const sampleEvidenceItem = {
    id: "e0000000-0000-0000-0000-000000000001",
    userId: "user-123",
    title: "Distributed Task Queue",
    description: "Built an in-memory task queue in Go with concurrent worker pools.",
    type: "project" as const,
    sourceUrl: "https://github.com/example/task-queue",
    createdAt: new Date("2026-09-08T10:00:00Z"),
    updatedAt: new Date("2026-09-08T10:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication checks", () => {
    it("rejects unauthenticated requests on evidence.list", async () => {
      const client = createUnauthenticatedCaller();
      await expect(client.evidence.list()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated requests on evidence.create", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.evidence.create({
          title: "Test Project",
          description: "Test description",
          type: "project",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("evidence.list & evidence.byId", () => {
    it("lists all evidence items for the authenticated user", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([sampleEvidenceItem]),
          }),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.list();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Distributed Task Queue");
    });

    it("fetches single evidence item by ID", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([sampleEvidenceItem]),
          }),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.byId({
        id: "e0000000-0000-0000-0000-000000000001",
      });

      expect(result.id).toBe("e0000000-0000-0000-0000-000000000001");
    });

    it("returns unavailableResource (404) if evidence item not found or not owned", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.evidence.byId({
          id: "e0000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("evidence.create & evidence.update", () => {
    it("creates a new evidence item with valid data", async () => {
      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([sampleEvidenceItem]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ insert: mockInsert });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.create({
        title: "Distributed Task Queue",
        description: "Built an in-memory task queue in Go with concurrent worker pools.",
        type: "project",
        sourceUrl: "https://github.com/example/task-queue",
      });

      expect(result.title).toBe("Distributed Task Queue");
      expect(mockInsert).toHaveBeenCalled();
    });

    it("rejects non-HTTPS URLs on create", async () => {
      const client = createAuthenticatedCaller();
      await expect(
        client.evidence.create({
          title: "Insecure Link",
          description: "Description",
          type: "project",
          sourceUrl: "http://example.com",
        }),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("updates an existing evidence item when owned", async () => {
      const updated = {
        ...sampleEvidenceItem,
        title: "Updated Task Queue",
      };
      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updated]),
          }),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ update: mockUpdate });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.update({
        id: "e0000000-0000-0000-0000-000000000001",
        title: "Updated Task Queue",
        description: "Updated description",
        type: "project",
      });

      expect(result.title).toBe("Updated Task Queue");
    });

    it("returns unavailableResource (404) if updating unowned item", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ update: mockUpdate });

      const client = createAuthenticatedCaller();
      await expect(
        client.evidence.update({
          id: "e0000000-0000-0000-0000-000000000099",
          title: "Forbidden Edit",
          description: "Description",
          type: "project",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("evidence.delete & evidence.getAttachedOpportunities", () => {
    it("deletes an evidence item when owned", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: "e0000000-0000-0000-0000-000000000001" },
          ]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ delete: mockDelete });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.delete({
        id: "e0000000-0000-0000-0000-000000000001",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("e0000000-0000-0000-0000-000000000001");
    });

    it("fetches attached opportunities for deletion warning", async () => {
      // 1. Evidence item ownership check
      // 2. Joined opportunity_evidence + opportunities query
      const mockSelect = jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { id: "e0000000-0000-0000-0000-000000000001" },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                {
                  opportunityId: "a0000000-0000-0000-0000-000000000001",
                  company: "Acme Corp",
                  role: "Staff Engineer",
                },
              ]),
            }),
          }),
        });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.getAttachedOpportunities({
        id: "e0000000-0000-0000-0000-000000000001",
      });

      expect(result).toHaveLength(1);
      expect(result[0].company).toBe("Acme Corp");
    });
  });

  describe("opportunity associations (listByOpportunityId, attach, detach, createAndAttach)", () => {
    it("partitions items into selected and available sets for opportunity", async () => {
      // 1. Opportunity ownership check
      // 2. Selected items query
      // 3. All user items query
      const mockSelect = jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { id: "a0000000-0000-0000-0000-000000000001" },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue([sampleEvidenceItem]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([
                sampleEvidenceItem,
                {
                  ...sampleEvidenceItem,
                  id: "e0000000-0000-0000-0000-000000000002",
                  title: "Second Project",
                },
              ]),
            }),
          }),
        });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.listByOpportunityId({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
      });

      expect(result.selected).toHaveLength(1);
      expect(result.available).toHaveLength(1);
      expect(result.available[0].id).toBe(
        "e0000000-0000-0000-0000-000000000002",
      );
    });

    it("attaches evidence item when user owns both opportunity and evidence", async () => {
      const mockSelect = jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { id: "a0000000-0000-0000-0000-000000000001" },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { id: "e0000000-0000-0000-0000-000000000001" },
              ]),
            }),
          }),
        });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.attach({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
        evidenceItemId: "e0000000-0000-0000-0000-000000000001",
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("rejects attaching if evidence item belongs to another user (dual ownership enforcement)", async () => {
      const mockSelect = jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { id: "a0000000-0000-0000-0000-000000000001" },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]), // Foreign evidence item!
            }),
          }),
        });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      await expect(
        client.evidence.attach({
          opportunityId: "a0000000-0000-0000-0000-000000000001",
          evidenceItemId: "e0000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("detaches evidence item from opportunity", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { id: "a0000000-0000-0000-0000-000000000001" },
            ]),
          }),
        }),
      });

      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.detach({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
        evidenceItemId: "e0000000-0000-0000-0000-000000000001",
      });

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    it("creates an item and attaches it to the opportunity in one step (createAndAttach)", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { id: "a0000000-0000-0000-0000-000000000001" },
            ]),
          }),
        }),
      });

      const mockInsert = jest
        .fn()
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([sampleEvidenceItem]),
          }),
        })
        .mockReturnValueOnce({
          values: jest.fn().mockResolvedValue(undefined),
        });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const client = createAuthenticatedCaller();
      const result = await client.evidence.createAndAttach({
        opportunityId: "a0000000-0000-0000-0000-000000000001",
        title: "Distributed Task Queue",
        description: "Built an in-memory task queue in Go with concurrent worker pools.",
        type: "project",
      });

      expect(result.success).toBe(true);
      expect(result.evidenceItem.title).toBe("Distributed Task Queue");
      expect(mockInsert).toHaveBeenCalledTimes(2);
    });
  });
});
