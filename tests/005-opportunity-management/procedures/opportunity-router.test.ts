/** @jest-environment node */
import { appRouter } from "@/trpc/routers/_app";
import { getDb } from "@/lib/db";
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

describe("opportunity router contract and procedures", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  it("exposes all required procedures on appRouter.opportunity", () => {
    const caller = appRouter.createCaller(authenticatedContext);
    expect(caller.opportunity.list).toBeDefined();
    expect(caller.opportunity.byId).toBeDefined();
    expect(caller.opportunity.create).toBeDefined();
    expect(caller.opportunity.update).toBeDefined();
    expect(caller.opportunity.delete).toBeDefined();
  });

  describe("authentication requirement", () => {
    it("rejects unauthenticated calls to all opportunity procedures", async () => {
      const anonCaller = appRouter.createCaller(unauthenticatedContext);

      await expect(anonCaller.opportunity.list()).rejects.toThrow(
        expect.objectContaining({ code: "UNAUTHORIZED" }),
      );

      await expect(
        anonCaller.opportunity.byId({ id: "opp-1" }),
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.opportunity.create({
          company: "Acme",
          role: "Developer",
          jobDescription: "Description",
          status: "draft",
        }),
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));

      await expect(
        anonCaller.opportunity.delete({ id: "opp-1" }),
      ).rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));
    });
  });

  describe("opportunity.create", () => {
    it("validates and creates an opportunity with user-scoping", async () => {
      const mockResult = {
        id: "opp-new-1",
        userId: "user-123",
        company: "Acme Corp",
        role: "Senior Engineer",
        jobDescription: "Build stuff",
        sourceUrl: "https://example.com/job",
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const valuesMock = jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockResult]),
      });
      mockDb.insert.mockReturnValue({ values: valuesMock });

      const caller = appRouter.createCaller(authenticatedContext);
      const result = await caller.opportunity.create({
        company: "Acme Corp",
        role: "Senior Engineer",
        jobDescription: "Build stuff",
        sourceUrl: "https://example.com/job",
        status: "draft",
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          company: "Acme Corp",
          role: "Senior Engineer",
          jobDescription: "Build stuff",
          sourceUrl: "https://example.com/job",
          status: "draft",
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it("rejects non-HTTPS source URLs during validation", async () => {
      const caller = appRouter.createCaller(authenticatedContext);

      await expect(
        caller.opportunity.create({
          company: "Acme Corp",
          role: "Engineer",
          jobDescription: "Build stuff",
          sourceUrl: "http://insecure.com/job",
          status: "draft",
        }),
      ).rejects.toThrow();
    });

    it("rejects empty company or role", async () => {
      const caller = appRouter.createCaller(authenticatedContext);

      await expect(
        caller.opportunity.create({
          company: "   ",
          role: "Engineer",
          jobDescription: "Build stuff",
          status: "draft",
        }),
      ).rejects.toThrow();

      await expect(
        caller.opportunity.create({
          company: "Acme Corp",
          role: "",
          jobDescription: "Build stuff",
          status: "draft",
        }),
      ).rejects.toThrow();
    });
  });

  describe("opportunity.list", () => {
    it("returns user-scoped opportunities ordered by updatedAt", async () => {
      const mockItems = [
        {
          id: "opp-1",
          company: "Alpha Inc",
          role: "Lead",
          status: "interviewing",
          sourceUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const limitMock = jest.fn().mockResolvedValue(mockItems);
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      const whereMock = jest.fn().mockReturnValue({ orderBy: orderByMock });
      const fromMock = jest.fn().mockReturnValue({ where: whereMock });
      mockDb.select.mockReturnValue({ from: fromMock });

      const caller = appRouter.createCaller(authenticatedContext);
      const result = await caller.opportunity.list({ limit: 10 });

      expect(mockDb.select).toHaveBeenCalled();
      expect(whereMock).toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockItems[0],
          lastAnalysisState: "none",
        },
      ]);
    });
  });

  describe("opportunity.byId and non-enumeration", () => {
    it("returns the record if owned by the caller", async () => {
      const mockRecord = {
        id: "opp-1",
        userId: "user-123",
        company: "Beta LLC",
        role: "Engineer",
        jobDescription: "Details here",
        sourceUrl: "https://beta.com/job",
        status: "applied",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const limitMock = jest.fn().mockResolvedValue([mockRecord]);
      const whereMock = jest.fn().mockReturnValue({ limit: limitMock });
      const fromMock = jest.fn().mockReturnValue({ where: whereMock });
      mockDb.select.mockReturnValue({ from: fromMock });

      const caller = appRouter.createCaller(authenticatedContext);
      const result = await caller.opportunity.byId({ id: "opp-1" });

      expect(result).toEqual({
        ...mockRecord,
        lastAnalysisState: "none",
      });
    });

    it("throws NOT_FOUND with unavailable resource message if nonexistent or owned by another user", async () => {
      const limitMock = jest.fn().mockResolvedValue([]);
      const whereMock = jest.fn().mockReturnValue({ limit: limitMock });
      const fromMock = jest.fn().mockReturnValue({ where: whereMock });
      mockDb.select.mockReturnValue({ from: fromMock });

      const caller = appRouter.createCaller(authenticatedContext);

      await expect(caller.opportunity.byId({ id: "opp-other-user" })).rejects.toThrow(
        new TRPCError({
          code: "NOT_FOUND",
          message: "The requested resource is unavailable.",
        }),
      );
    });
  });

  describe("opportunity.update", () => {
    it("updates the opportunity after verifying ownership", async () => {
      const mockExisting = { id: "opp-1" };
      const mockUpdated = {
        id: "opp-1",
        userId: "user-123",
        company: "Acme Updated",
        role: "Staff Engineer",
        jobDescription: "New details",
        sourceUrl: "https://example.com/job",
        status: "interviewing",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // select existing check
      const selectLimitMock = jest.fn().mockResolvedValue([mockExisting]);
      const selectWhereMock = jest.fn().mockReturnValue({ limit: selectLimitMock });
      const selectFromMock = jest.fn().mockReturnValue({ where: selectWhereMock });
      mockDb.select.mockReturnValue({ from: selectFromMock });

      // update
      const updateReturningMock = jest.fn().mockResolvedValue([mockUpdated]);
      const updateWhereMock = jest.fn().mockReturnValue({ returning: updateReturningMock });
      const updateSetMock = jest.fn().mockReturnValue({ where: updateWhereMock });
      mockDb.update.mockReturnValue({ set: updateSetMock });

      const caller = appRouter.createCaller(authenticatedContext);
      const result = await caller.opportunity.update({
        id: "opp-1",
        company: "Acme Updated",
        role: "Staff Engineer",
        jobDescription: "New details",
        sourceUrl: "https://example.com/job",
        status: "interviewing",
      });

      expect(result).toEqual(mockUpdated);
    });

    it("throws NOT_FOUND if attempting to update another user's opportunity", async () => {
      // select existing returns empty
      const selectLimitMock = jest.fn().mockResolvedValue([]);
      const selectWhereMock = jest.fn().mockReturnValue({ limit: selectLimitMock });
      const selectFromMock = jest.fn().mockReturnValue({ where: selectWhereMock });
      mockDb.select.mockReturnValue({ from: selectFromMock });

      const caller = appRouter.createCaller(authenticatedContext);

      await expect(
        caller.opportunity.update({
          id: "opp-foreign",
          company: "Hacker Corp",
          role: "Role",
          jobDescription: "Desc",
          status: "applied",
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "The requested resource is unavailable.",
        }),
      );
    });
  });

  describe("opportunity.delete", () => {
    it("deletes the opportunity when owned by caller", async () => {
      const deleteReturningMock = jest.fn().mockResolvedValue([{ id: "opp-1" }]);
      const deleteWhereMock = jest.fn().mockReturnValue({ returning: deleteReturningMock });
      mockDb.delete.mockReturnValue({ where: deleteWhereMock });

      const caller = appRouter.createCaller(authenticatedContext);
      const result = await caller.opportunity.delete({ id: "opp-1" });

      expect(result).toEqual({ success: true, id: "opp-1" });
    });

    it("throws NOT_FOUND if attempting to delete another user's opportunity", async () => {
      const deleteReturningMock = jest.fn().mockResolvedValue([]);
      const deleteWhereMock = jest.fn().mockReturnValue({ returning: deleteReturningMock });
      mockDb.delete.mockReturnValue({ where: deleteWhereMock });

      const caller = appRouter.createCaller(authenticatedContext);

      await expect(
        caller.opportunity.delete({ id: "opp-foreign" }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "The requested resource is unavailable.",
        }),
      );
    });
  });
});
