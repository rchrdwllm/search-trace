import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "@/lib/db";
import { userDailyUsage } from "@/lib/db/schema";

export const DEFAULT_DAILY_EXTRACTION_LIMIT = 5;

export function getDailyExtractionLimit(): number {
  const envLimit = process.env.DAILY_EXTRACTION_LIMIT;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_DAILY_EXTRACTION_LIMIT;
}

export function getTodayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getNextMidnightUtcString(): string {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return nextMidnight.toISOString();
}

export interface DailyUsageStatus {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

/**
 * Checks current daily usage for a user on a given action without incrementing.
 */
export async function getDailyUsage(
  userId: string,
  action = "requirement_extraction",
  date = getTodayUtcDateString()
): Promise<DailyUsageStatus> {
  const db = getDb();
  const limit = getDailyExtractionLimit();
  const resetsAt = getNextMidnightUtcString();

  const [record] = await db
    .select({ count: userDailyUsage.count })
    .from(userDailyUsage)
    .where(
      and(
        eq(userDailyUsage.userId, userId),
        eq(userDailyUsage.action, action),
        eq(userDailyUsage.date, date)
      )
    );

  const used = record?.count ?? 0;
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    resetsAt,
  };
}

/**
 * Asserts that the user has remaining daily quota for the specified action.
 * Throws TRPCError with code TOO_MANY_REQUESTS if quota is exhausted.
 */
export async function assertWithinDailyLimit(
  userId: string,
  action = "requirement_extraction",
  date = getTodayUtcDateString()
): Promise<DailyUsageStatus> {
  const status = await getDailyUsage(userId, action, date);

  if (status.used >= status.limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Daily extraction limit reached (${status.limit}/day). Resets at midnight UTC.`,
    });
  }

  return status;
}

/**
 * Atomically increments the daily usage count for a user.
 */
export async function incrementDailyUsage(
  userId: string,
  action = "requirement_extraction",
  date = getTodayUtcDateString()
): Promise<DailyUsageStatus> {
  const db = getDb();

  await db
    .insert(userDailyUsage)
    .values({
      userId,
      action,
      date,
      count: 1,
    })
    .onConflictDoUpdate({
      target: [userDailyUsage.userId, userDailyUsage.action, userDailyUsage.date],
      set: {
        count: sql`${userDailyUsage.count} + 1`,
        updatedAt: new Date(),
      },
    });

  return await getDailyUsage(userId, action, date);
}
