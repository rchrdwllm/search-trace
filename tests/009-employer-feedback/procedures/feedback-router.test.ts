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

describe("feedbackRouter contract and procedures", () => {
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
    role: "Backend Engineer",
    jobDescription: "Build microservices in Go and Kubernetes.",
  };

  const sampleFeedbackItem = {
    id: "fb-0000-0000-0000-000000000001",
    opportunityId: "opp-0000-0000-0000-000000000001",
    userId: "user-123",
    feedbackDate: "2026-09-08",
    text: "Team appreciated the architectural discussion but noted concerns regarding hands-on Kubernetes operations.",
    sourceType: "interview_feedback" as const,
    provenance: "exact_quote" as const,
    aiOptIn: false,
    createdAt: new Date("2026-09-08T10:00:00Z"),
    updatedAt: new Date("2026-09-08T10:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication checks", () => {
    it("rejects unauthenticated requests on feedback.listByOpportunityId", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.feedback.listByOpportunityId({
          opportunityId: "opp-0000-0000-0000-000000000001",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated requests on feedback.byId", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.feedback.byId({
          id: "fb-0000-0000-0000-000000000001",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated requests on feedback.create", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.feedback.create({
          opportunityId: "opp-0000-0000-0000-000000000001",
          feedbackDate: "2026-09-08",
          text: "Some feedback",
          sourceType: "recruiter_feedback",
          provenance: "exact_quote",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated requests on feedback.update", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.feedback.update({
          id: "fb-0000-0000-0000-000000000001",
          feedbackDate: "2026-09-08",
          text: "Updated text",
          sourceType: "recruiter_feedback",
          provenance: "exact_quote",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated requests on feedback.setAiOptIn", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.feedback.setAiOptIn({
          id: "fb-0000-0000-0000-000000000001",
          aiOptIn: true,
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated requests on feedback.delete", async () => {
      const client = createUnauthenticatedCaller();
      await expect(
        client.feedback.delete({
          id: "fb-0000-0000-0000-000000000001",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("feedback.listByOpportunityId", () => {
    it("lists all feedback items for an owned opportunity ordered by date desc", async () => {
      const mockSelect = jest.fn();
      // First select checks opportunity ownership
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([sampleOpportunity]),
          }),
        }),
      });
      // Second select queries feedback items
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([sampleFeedbackItem]),
          }),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const result = await client.feedback.listByOpportunityId({
        opportunityId: sampleOpportunity.id,
      });

      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("Kubernetes operations");
      expect(result[0].provenance).toBe("exact_quote");
      expect(result[0].aiOptIn).toBe(false);
    });

    it("returns 404 unavailableResource when opportunity does not exist or belongs to another user", async () => {
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
        client.feedback.listByOpportunityId({
          opportunityId: "foreign-opportunity-id",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });
  });

  describe("feedback.byId", () => {
    it("returns feedback item when caller is the owner", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([sampleFeedbackItem]),
          }),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const client = createAuthenticatedCaller();
      const result = await client.feedback.byId({
        id: sampleFeedbackItem.id,
      });

      expect(result.id).toBe(sampleFeedbackItem.id);
      expect(result.sourceType).toBe("interview_feedback");
    });

    it("returns 404 unavailableResource when feedback item does not exist or is foreign", async () => {
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
        client.feedback.byId({ id: "non-existent-or-foreign-id" }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });
  });

  describe("feedback.create", () => {
    it("creates feedback item with default aiOptIn = false", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([sampleOpportunity]),
          }),
        }),
      });
      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([sampleFeedbackItem]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const client = createAuthenticatedCaller();
      const result = await client.feedback.create({
        opportunityId: sampleOpportunity.id,
        feedbackDate: "2026-09-08",
        text: "Team appreciated the architectural discussion but noted concerns regarding hands-on Kubernetes operations.",
        sourceType: "interview_feedback",
        provenance: "exact_quote",
      });

      expect(result.id).toBe(sampleFeedbackItem.id);
      expect(result.aiOptIn).toBe(false);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("rejects creation if target opportunity belongs to another user", async () => {
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
        client.feedback.create({
          opportunityId: "foreign-opp-id",
          feedbackDate: "2026-09-08",
          text: "Some feedback",
          sourceType: "recruiter_feedback",
          provenance: "personal_summary",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });

    it("rejects empty or whitespace-only feedback text", async () => {
      const client = createAuthenticatedCaller();
      await expect(
        client.feedback.create({
          opportunityId: sampleOpportunity.id,
          feedbackDate: "2026-09-08",
          text: "   ",
          sourceType: "recruiter_feedback",
          provenance: "exact_quote",
        }),
      ).rejects.toThrow();
    });

    it("rejects feedback text exceeding 5,000 characters", async () => {
      const client = createAuthenticatedCaller();
      await expect(
        client.feedback.create({
          opportunityId: sampleOpportunity.id,
          feedbackDate: "2026-09-08",
          text: "a".repeat(5001),
          sourceType: "recruiter_feedback",
          provenance: "exact_quote",
        }),
      ).rejects.toThrow();
    });

    it("rejects invalid date format", async () => {
      const client = createAuthenticatedCaller();
      await expect(
        client.feedback.create({
          opportunityId: sampleOpportunity.id,
          feedbackDate: "09/08/2026",
          text: "Valid text",
          sourceType: "recruiter_feedback",
          provenance: "exact_quote",
        }),
      ).rejects.toThrow();
    });
  });

  describe("feedback.update", () => {
    it("updates feedback item details when caller is owner", async () => {
      const updatedItem = {
        ...sampleFeedbackItem,
        provenance: "personal_summary" as const,
        text: "Updated summary text",
      };

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedItem]),
          }),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ update: mockUpdate });

      const client = createAuthenticatedCaller();
      const result = await client.feedback.update({
        id: sampleFeedbackItem.id,
        feedbackDate: "2026-09-08",
        text: "Updated summary text",
        sourceType: "interview_feedback",
        provenance: "personal_summary",
      });

      expect(result.provenance).toBe("personal_summary");
      expect(result.text).toBe("Updated summary text");
    });

    it("returns 404 when updating non-existent or foreign feedback item", async () => {
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
        client.feedback.update({
          id: "foreign-id",
          feedbackDate: "2026-09-08",
          text: "Updated summary text",
          sourceType: "interview_feedback",
          provenance: "personal_summary",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });
  });

  describe("feedback.setAiOptIn", () => {
    it("toggles aiOptIn to true for owned item", async () => {
      const optedInItem = {
        ...sampleFeedbackItem,
        aiOptIn: true,
      };

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([optedInItem]),
          }),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ update: mockUpdate });

      const client = createAuthenticatedCaller();
      const result = await client.feedback.setAiOptIn({
        id: sampleFeedbackItem.id,
        aiOptIn: true,
      });

      expect(result.aiOptIn).toBe(true);
    });

    it("returns 404 when toggling aiOptIn on foreign or missing item", async () => {
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
        client.feedback.setAiOptIn({
          id: "foreign-id",
          aiOptIn: true,
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });
  });

  describe("feedback.delete", () => {
    it("deletes feedback item when caller is owner", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: sampleFeedbackItem.id }]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ delete: mockDelete });

      const client = createAuthenticatedCaller();
      const result = await client.feedback.delete({
        id: sampleFeedbackItem.id,
      });

      expect(result).toEqual({ success: true, id: sampleFeedbackItem.id });
    });

    it("returns 404 when deleting foreign or missing feedback item", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({ delete: mockDelete });

      const client = createAuthenticatedCaller();
      await expect(
        client.feedback.delete({ id: "foreign-id" }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "The requested resource is unavailable.",
      });
    });
  });
});
