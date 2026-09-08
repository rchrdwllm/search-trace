import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { opportunities } from "@/lib/db/schema";
import {
  createOpportunityInputSchema,
  updateOpportunityInputSchema,
} from "@/lib/validations/opportunity";
import { protectedProcedure, router, unavailableResource } from "@/trpc/init";

export const opportunityRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;

      const items = await db
        .select({
          id: opportunities.id,
          company: opportunities.company,
          role: opportunities.role,
          status: opportunities.status,
          sourceUrl: opportunities.sourceUrl,
          createdAt: opportunities.createdAt,
          updatedAt: opportunities.updatedAt,
        })
        .from(opportunities)
        .where(eq(opportunities.userId, ctx.actorId))
        .orderBy(desc(opportunities.updatedAt))
        .limit(limit);

      return items.map((item) => ({
        ...item,
        lastAnalysisState: "none" as "none" | "pending" | "completed",
      }));
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const [record] = await db
        .select()
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.id),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!record) {
        unavailableResource();
      }

      return {
        ...record,
        lastAnalysisState: "none" as "none" | "pending" | "completed",
      };
    }),

  create: protectedProcedure
    .input(createOpportunityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [record] = await db
        .insert(opportunities)
        .values({
          userId: ctx.actorId,
          company: input.company,
          role: input.role,
          jobDescription: input.jobDescription,
          sourceUrl: input.sourceUrl ?? null,
          status: input.status,
        })
        .returning();

      return record;
    }),

  update: protectedProcedure
    .input(updateOpportunityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check ownership first
      const [existing] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.id),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!existing) {
        unavailableResource();
      }

      const [updated] = await db
        .update(opportunities)
        .set({
          company: input.company,
          role: input.role,
          jobDescription: input.jobDescription,
          sourceUrl: input.sourceUrl ?? null,
          status: input.status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(opportunities.id, input.id),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [deleted] = await db
        .delete(opportunities)
        .where(
          and(
            eq(opportunities.id, input.id),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .returning({ id: opportunities.id });

      if (!deleted) {
        unavailableResource();
      }

      return { success: true, id: deleted.id };
    }),
});
