/** @jest-environment node */

import {
  getDailyExtractionLimit,
  getTodayUtcDateString,
  getNextMidnightUtcString,
  getDailyUsage,
  assertWithinDailyLimit,
  incrementDailyUsage,
  DEFAULT_DAILY_EXTRACTION_LIMIT,
} from "@/lib/ai/rate-limiter";
import { getDb } from "@/lib/db";
import { TRPCError } from "@trpc/server";

jest.mock("@/lib/db", () => ({
  getDb: jest.fn(),
}));

describe("Rate Limiter (lib/ai/rate-limiter.ts)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("utility functions", () => {
    it("returns default limit of 5 when env variable is not set", () => {
      delete process.env.DAILY_EXTRACTION_LIMIT;
      expect(getDailyExtractionLimit()).toBe(DEFAULT_DAILY_EXTRACTION_LIMIT);
    });

    it("returns configured limit from env variable when valid", () => {
      process.env.DAILY_EXTRACTION_LIMIT = "10";
      expect(getDailyExtractionLimit()).toBe(10);
    });

    it("returns UTC date in YYYY-MM-DD format", () => {
      const dateStr = getTodayUtcDateString();
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("returns tomorrow midnight in ISO format", () => {
      const midnightStr = getNextMidnightUtcString();
      const date = new Date(midnightStr);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
    });
  });

  describe("database query procedures", () => {
    it("returns 0 used and full limit remaining when no usage recorded", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const status = await getDailyUsage("user-1");
      expect(status.used).toBe(0);
      expect(status.remaining).toBe(5);
      expect(status.limit).toBe(5);
    });

    it("returns correct count when existing usage is found", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 3 }]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const status = await getDailyUsage("user-1");
      expect(status.used).toBe(3);
      expect(status.remaining).toBe(2);
      expect(status.limit).toBe(5);
    });

    it("assertWithinDailyLimit succeeds when under quota", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 4 }]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      const status = await assertWithinDailyLimit("user-1");
      expect(status.used).toBe(4);
      expect(status.remaining).toBe(1);
    });

    it("assertWithinDailyLimit throws TOO_MANY_REQUESTS when at quota", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 5 }]),
        }),
      });
      (getDb as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(assertWithinDailyLimit("user-1")).rejects.toThrow(TRPCError);
      await expect(assertWithinDailyLimit("user-1")).rejects.toMatchObject({
        code: "TOO_MANY_REQUESTS",
      });
    });

    it("incrementDailyUsage performs upsert and returns updated status", async () => {
      const mockOnConflictDoUpdate = jest.fn().mockResolvedValue({});
      const mockValues = jest.fn().mockReturnValue({
        onConflictDoUpdate: mockOnConflictDoUpdate,
      });
      const mockInsert = jest.fn().mockReturnValue({
        values: mockValues,
      });

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      (getDb as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
      });

      const status = await incrementDailyUsage("user-1");
      expect(mockInsert).toHaveBeenCalled();
      expect(status.used).toBe(1);
      expect(status.remaining).toBe(4);
    });
  });
});
