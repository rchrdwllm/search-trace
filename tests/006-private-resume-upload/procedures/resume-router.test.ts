/** @jest-environment node */
import { appRouter } from "@/trpc/routers/_app";
import { getDb } from "@/lib/db";
import { getResumeStorageService } from "@/lib/storage/resume";

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

describe("resume router contract and procedures", () => {
  const actorId = "user-123";
  const opportunityId = "opp-123";

  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const authenticatedContext = {
    requestId: "test-req-id",
    session: {
      user: {
        id: actorId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-123",
        userId: actorId,
        expiresAt: new Date(Date.now() + 3600000),
        token: "test-token",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    actorId,
  };

  const unauthenticatedContext = {
    requestId: "test-req-id-anon",
    session: null,
    actorId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockReturnValue(mockDb);
    getResumeStorageService().clear?.();
  });

  it("exposes all required procedures on appRouter.resume", () => {
    const caller = appRouter.createCaller(authenticatedContext);
    expect(caller.resume.getByOpportunityId).toBeDefined();
    expect(caller.resume.updateReviewedText).toBeDefined();
    expect(caller.resume.setAiOptIn).toBeDefined();
    expect(caller.resume.getDownloadUrl).toBeDefined();
    expect(caller.resume.retryExtraction).toBeDefined();
    expect(caller.resume.delete).toBeDefined();
  });

  describe("authentication requirement", () => {
    it("rejects unauthenticated calls to all resume procedures", async () => {
      const anonCaller = appRouter.createCaller(unauthenticatedContext);

      await expect(
        anonCaller.resume.getByOpportunityId({ opportunityId })
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.resume.updateReviewedText({ opportunityId, reviewedText: "text" })
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.resume.setAiOptIn({ opportunityId, enabled: true })
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.resume.getDownloadUrl({ opportunityId })
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.resume.retryExtraction({ opportunityId })
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.resume.delete({ opportunityId })
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));
    });
  });

  describe("ownership verification and non-enumeration", () => {
    it("throws NOT_FOUND unavailableResource if opportunity is missing or owned by another user", async () => {
      const caller = appRouter.createCaller(authenticatedContext);

      // Return empty array for opportunity query (nonexistent or foreign)
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        caller.resume.getByOpportunityId({ opportunityId: "foreign-opp" })
      ).rejects.toThrow(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "The requested resource is unavailable.",
        })
      );

      await expect(
        caller.resume.updateReviewedText({ opportunityId: "foreign-opp", reviewedText: "new text" })
      ).rejects.toThrow(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "The requested resource is unavailable.",
        })
      );
    });
  });

  describe("resume.getByOpportunityId", () => {
    it("returns null if no resume is attached to the owned opportunity", async () => {
      const caller = appRouter.createCaller(authenticatedContext);

      // First query: opportunity found
      // Second query: resume not found
      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(async () => {
              callCount++;
              if (callCount === 1) return [{ id: opportunityId }];
              return [];
            }),
          }),
        }),
      }));

      const result = await caller.resume.getByOpportunityId({ opportunityId });
      expect(result).toBeNull();
    });

    it("returns resume record when one exists", async () => {
      const caller = appRouter.createCaller(authenticatedContext);
      const mockResume = {
        id: "res-1",
        opportunityId,
        userId: actorId,
        fileName: "resume.pdf",
        fileSize: 100000,
        fileType: "application/pdf",
        storagePath: "user-123/opp-123/uuid-resume.pdf",
        extractionState: "ready",
        extractedText: "Full extracted text",
        reviewedText: "Full extracted text",
        aiOptIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(async () => {
              callCount++;
              if (callCount === 1) return [{ id: opportunityId }];
              return [mockResume];
            }),
          }),
        }),
      }));

      const result = await caller.resume.getByOpportunityId({ opportunityId });
      expect(result).toEqual(mockResume);
    });
  });

  describe("resume.updateReviewedText", () => {
    it("updates reviewed text and maintains ready state", async () => {
      const caller = appRouter.createCaller(authenticatedContext);

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: opportunityId }]),
          }),
        }),
      });

      const updatedDate = new Date();
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: "res-1",
                reviewedText: "Updated résumé text content",
                extractionState: "ready",
                updatedAt: updatedDate,
              },
            ]),
          }),
        }),
      });

      const result = await caller.resume.updateReviewedText({
        opportunityId,
        reviewedText: "  Updated résumé text content  ",
      });

      expect(result.success).toBe(true);
      expect(result.reviewedText).toBe("Updated résumé text content");
      expect(result.extractionState).toBe("ready");
    });
  });

  describe("resume.setAiOptIn", () => {
    it("updates aiOptIn flag", async () => {
      const caller = appRouter.createCaller(authenticatedContext);

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: opportunityId }]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: "res-1",
                aiOptIn: true,
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      });

      const result = await caller.resume.setAiOptIn({
        opportunityId,
        enabled: true,
      });

      expect(result.success).toBe(true);
      expect(result.aiOptIn).toBe(true);
    });
  });

  describe("resume.getDownloadUrl", () => {
    it("generates a signed download url for an uploaded resume", async () => {
      const caller = appRouter.createCaller(authenticatedContext);
      const storage = getResumeStorageService();
      const storagePath = "user-123/opp-123/file.pdf";
      await storage.uploadFile(storagePath, Buffer.from("pdf"), "application/pdf");

      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(async () => {
              callCount++;
              if (callCount === 1) return [{ id: opportunityId }];
              return [{ storagePath }];
            }),
          }),
        }),
      }));

      const result = await caller.resume.getDownloadUrl({ opportunityId });
      expect(result.expiresInSeconds).toBe(60);
      expect(result.downloadUrl).toContain("mock-signed-token");
    });
  });

  describe("resume.retryExtraction", () => {
    it("re-runs text extraction and updates database", async () => {
      const caller = appRouter.createCaller(authenticatedContext);
      const storage = getResumeStorageService();
      const storagePath = "user-123/opp-123/sample.pdf";
      await storage.uploadFile(storagePath, Buffer.from("%PDF-1.4 mock pdf"), "application/pdf");

      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(async () => {
              callCount++;
              if (callCount === 1) return [{ id: opportunityId }];
              return [
                {
                  id: "res-1",
                  storagePath,
                  fileType: "application/pdf",
                },
              ];
            }),
          }),
        }),
      }));

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: "res-1",
                extractionState: "ready",
                extractedText: "Extracted text content",
                reviewedText: "Extracted text content",
              },
            ]),
          }),
        }),
      });

      const result = await caller.resume.retryExtraction({ opportunityId });
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("extractionState");
    });
  });

  describe("resume.delete", () => {
    it("deletes file from storage and database row", async () => {
      const caller = appRouter.createCaller(authenticatedContext);
      const storage = getResumeStorageService();
      const storagePath = "user-123/opp-123/file.pdf";
      await storage.uploadFile(storagePath, Buffer.from("pdf"), "application/pdf");

      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(async () => {
              callCount++;
              if (callCount === 1) return [{ id: opportunityId }];
              return [{ id: "res-1", storagePath }];
            }),
          }),
        }),
      }));

      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await caller.resume.delete({ opportunityId });
      expect(result.success).toBe(true);
      expect(storage.hasFile?.(storagePath)).toBe(false);
    });
  });
});
