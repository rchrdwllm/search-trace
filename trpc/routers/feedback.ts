import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { feedbackItems, opportunities } from "@/lib/db/schema";
import {
  createFeedbackItemSchema,
  deleteFeedbackItemSchema,
  getFeedbackItemByIdSchema,
  listFeedbackItemsSchema,
  setFeedbackAiOptInSchema,
  updateFeedbackItemSchema,
} from "@/lib/validations/feedback";
import { protectedProcedure, router, unavailableResource } from "@/trpc/init";

export const feedbackRouter = router({
  listByOpportunityId: protectedProcedure
    .input(listFeedbackItemsSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership to prevent resource existence leakage
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const items = await db
        .select()
        .from(feedbackItems)
        .where(
          and(
            eq(feedbackItems.opportunityId, input.opportunityId),
            eq(feedbackItems.userId, ctx.actorId),
          ),
        )
        .orderBy(
          desc(feedbackItems.feedbackDate),
          desc(feedbackItems.createdAt),
        );

      return items;
    }),

  byId: protectedProcedure
    .input(getFeedbackItemByIdSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [item] = await db
        .select()
        .from(feedbackItems)
        .where(
          and(
            eq(feedbackItems.id, input.id),
            eq(feedbackItems.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!item) {
        unavailableResource();
      }

      return item;
    }),

  create: protectedProcedure
    .input(createFeedbackItemSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership before creating feedback
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [created] = await db
        .insert(feedbackItems)
        .values({
          opportunityId: input.opportunityId,
          userId: ctx.actorId,
          feedbackDate: input.feedbackDate,
          text: input.text,
          sourceType: input.sourceType,
          provenance: input.provenance,
          aiOptIn: input.aiOptIn ?? false,
        })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(updateFeedbackItemSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [updated] = await db
        .update(feedbackItems)
        .set({
          feedbackDate: input.feedbackDate,
          text: input.text,
          sourceType: input.sourceType,
          provenance: input.provenance,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(feedbackItems.id, input.id),
            eq(feedbackItems.userId, ctx.actorId),
          ),
        )
        .returning();

      if (!updated) {
        unavailableResource();
      }

      return updated;
    }),

  setAiOptIn: protectedProcedure
    .input(setFeedbackAiOptInSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [updated] = await db
        .update(feedbackItems)
        .set({
          aiOptIn: input.aiOptIn,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(feedbackItems.id, input.id),
            eq(feedbackItems.userId, ctx.actorId),
          ),
        )
        .returning();

      if (!updated) {
        unavailableResource();
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(deleteFeedbackItemSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [deleted] = await db
        .delete(feedbackItems)
        .where(
          and(
            eq(feedbackItems.id, input.id),
            eq(feedbackItems.userId, ctx.actorId),
          ),
        )
        .returning({ id: feedbackItems.id });

      if (!deleted) {
        unavailableResource();
      }

      return { success: true, id: deleted.id };
    }),
});
