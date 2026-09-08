import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  evidenceItems,
  opportunities,
  opportunityEvidence,
} from "@/lib/db/schema";
import {
  attachEvidenceInputSchema,
  createAndAttachEvidenceInputSchema,
  createEvidenceItemSchema,
  detachEvidenceInputSchema,
  updateEvidenceItemSchema,
} from "@/lib/validations/evidence";
import { protectedProcedure, router, unavailableResource } from "@/trpc/init";

export const evidenceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db
      .select()
      .from(evidenceItems)
      .where(eq(evidenceItems.userId, ctx.actorId))
      .orderBy(desc(evidenceItems.updatedAt));

    return items;
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().trim().min(1, "Evidence item ID is required") }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [item] = await db
        .select()
        .from(evidenceItems)
        .where(
          and(
            eq(evidenceItems.id, input.id),
            eq(evidenceItems.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!item) {
        unavailableResource();
      }

      return item;
    }),

  create: protectedProcedure
    .input(createEvidenceItemSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [created] = await db
        .insert(evidenceItems)
        .values({
          userId: ctx.actorId,
          title: input.title,
          description: input.description,
          type: input.type,
          sourceUrl: input.sourceUrl ?? null,
        })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(updateEvidenceItemSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [updated] = await db
        .update(evidenceItems)
        .set({
          title: input.title,
          description: input.description,
          type: input.type,
          sourceUrl: input.sourceUrl ?? null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(evidenceItems.id, input.id),
            eq(evidenceItems.userId, ctx.actorId),
          ),
        )
        .returning();

      if (!updated) {
        unavailableResource();
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().trim().min(1, "Evidence item ID is required") }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [deleted] = await db
        .delete(evidenceItems)
        .where(
          and(
            eq(evidenceItems.id, input.id),
            eq(evidenceItems.userId, ctx.actorId),
          ),
        )
        .returning({ id: evidenceItems.id });

      if (!deleted) {
        unavailableResource();
      }

      return { success: true, id: deleted.id };
    }),

  getAttachedOpportunities: protectedProcedure
    .input(z.object({ id: z.string().trim().min(1, "Evidence item ID is required") }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const [item] = await db
        .select({ id: evidenceItems.id })
        .from(evidenceItems)
        .where(
          and(
            eq(evidenceItems.id, input.id),
            eq(evidenceItems.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!item) {
        unavailableResource();
      }

      const attached = await db
        .select({
          opportunityId: opportunities.id,
          company: opportunities.company,
          role: opportunities.role,
        })
        .from(opportunityEvidence)
        .innerJoin(
          opportunities,
          eq(opportunityEvidence.opportunityId, opportunities.id),
        )
        .where(
          and(
            eq(opportunityEvidence.evidenceItemId, input.id),
            eq(opportunityEvidence.userId, ctx.actorId),
          ),
        );

      return attached;
    }),

  listByOpportunityId: protectedProcedure
    .input(
      z.object({
        opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const [opp] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!opp) {
        unavailableResource();
      }

      const selected = await db
        .select({
          id: evidenceItems.id,
          userId: evidenceItems.userId,
          title: evidenceItems.title,
          description: evidenceItems.description,
          type: evidenceItems.type,
          sourceUrl: evidenceItems.sourceUrl,
          createdAt: evidenceItems.createdAt,
          updatedAt: evidenceItems.updatedAt,
        })
        .from(opportunityEvidence)
        .innerJoin(
          evidenceItems,
          eq(opportunityEvidence.evidenceItemId, evidenceItems.id),
        )
        .where(
          and(
            eq(opportunityEvidence.opportunityId, input.opportunityId),
            eq(opportunityEvidence.userId, ctx.actorId),
          ),
        )
        .orderBy(desc(evidenceItems.updatedAt));

      const selectedIdSet = new Set(selected.map((item) => item.id));

      const allUserItems = await db
        .select()
        .from(evidenceItems)
        .where(eq(evidenceItems.userId, ctx.actorId))
        .orderBy(desc(evidenceItems.updatedAt));

      const available = allUserItems.filter((item) => !selectedIdSet.has(item.id));

      return {
        selected,
        available,
      };
    }),

  attach: protectedProcedure
    .input(attachEvidenceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Dual ownership check: verify opportunity belongs to actor
      const [opp] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!opp) {
        unavailableResource();
      }

      // Verify evidence item belongs to actor
      const [item] = await db
        .select({ id: evidenceItems.id })
        .from(evidenceItems)
        .where(
          and(
            eq(evidenceItems.id, input.evidenceItemId),
            eq(evidenceItems.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!item) {
        unavailableResource();
      }

      await db
        .insert(opportunityEvidence)
        .values({
          opportunityId: input.opportunityId,
          evidenceItemId: input.evidenceItemId,
          userId: ctx.actorId,
        })
        .onConflictDoNothing({
          target: [
            opportunityEvidence.opportunityId,
            opportunityEvidence.evidenceItemId,
          ],
        });

      return { success: true };
    }),

  detach: protectedProcedure
    .input(detachEvidenceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [opp] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!opp) {
        unavailableResource();
      }

      await db
        .delete(opportunityEvidence)
        .where(
          and(
            eq(opportunityEvidence.opportunityId, input.opportunityId),
            eq(opportunityEvidence.evidenceItemId, input.evidenceItemId),
            eq(opportunityEvidence.userId, ctx.actorId),
          ),
        );

      return { success: true };
    }),

  createAndAttach: protectedProcedure
    .input(createAndAttachEvidenceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [opp] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId),
          ),
        )
        .limit(1);

      if (!opp) {
        unavailableResource();
      }

      const [createdItem] = await db
        .insert(evidenceItems)
        .values({
          userId: ctx.actorId,
          title: input.title,
          description: input.description,
          type: input.type,
          sourceUrl: input.sourceUrl ?? null,
        })
        .returning();

      await db.insert(opportunityEvidence).values({
        opportunityId: input.opportunityId,
        evidenceItemId: createdItem.id,
        userId: ctx.actorId,
      });

      return {
        success: true,
        evidenceItem: createdItem,
      };
    }),
});
