import "server-only";

import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "@/lib/db";
import { opportunities, requirements } from "@/lib/db/schema";
import {
  extractRequirementsInputSchema,
  saveRequirementsInputSchema,
  deleteRequirementInputSchema,
  getRequirementsInputSchema,
} from "@/lib/validations/requirement";
import { protectedProcedure, router, unavailableResource } from "@/trpc/init";
import {
  assertWithinDailyLimit,
  getDailyUsage,
  incrementDailyUsage,
} from "@/lib/ai/rate-limiter";
import { getAiExtractorService } from "@/lib/ai";
import { verifyCitation } from "@/lib/extraction/citation-verifier";

export const requirementRouter = router({
  extract: protectedProcedure
    .input(extractRequirementsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity exists and is owned by authenticated user
      const [opp] = await db
        .select({
          id: opportunities.id,
          jobDescription: opportunities.jobDescription,
          userId: opportunities.userId,
        })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        );

      if (!opp) {
        throw unavailableResource();
      }

      if (!opp.jobDescription || opp.jobDescription.trim().length < 50) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job description must be at least 50 characters to extract requirements.",
        });
      }

      // Check daily rate limit (5 extractions per day)
      await assertWithinDailyLimit(ctx.actorId, "requirement_extraction");

      // Invoke AI extraction service (Gemini 3.6 Flash via Vercel AI SDK or InMemory mock)
      const extractor = getAiExtractorService();
      const extracted = await extractor.extractRequirements({
        jobDescription: opp.jobDescription,
      });

      // Increment daily usage counter upon successful extraction
      const dailyUsage = await incrementDailyUsage(ctx.actorId, "requirement_extraction");

      const draftRequirements = extracted.map((req, index) => ({
        tempId: crypto.randomUUID(),
        title: req.title,
        category: req.category,
        jobDescriptionExcerpt: req.jobDescriptionExcerpt,
        orderIndex: req.orderIndex ?? index,
      }));

      return {
        draftRequirements,
        dailyUsage,
      };
    }),

  listByOpportunityId: protectedProcedure
    .input(getRequirementsInputSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity exists and belongs to user
      const [opp] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        );

      if (!opp) {
        throw unavailableResource();
      }

      const rows = await db
        .select()
        .from(requirements)
        .where(
          and(
            eq(requirements.opportunityId, input.opportunityId),
            eq(requirements.userId, ctx.actorId)
          )
        )
        .orderBy(requirements.orderIndex);

      return rows;
    }),

  save: protectedProcedure
    .input(saveRequirementsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity exists and belongs to user
      const [opp] = await db
        .select({
          id: opportunities.id,
          jobDescription: opportunities.jobDescription,
        })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        );

      if (!opp) {
        throw unavailableResource();
      }

      // Authoritatively verify citations for all items with excerpts
      for (const item of input.requirements) {
        if (item.jobDescriptionExcerpt) {
          const isValid = verifyCitation(opp.jobDescription, item.jobDescriptionExcerpt);
          if (!isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Citation excerpt "${item.jobDescriptionExcerpt.slice(0, 40)}..." does not match the job description.`,
            });
          }
        }
      }

      // Atomically replace requirements for this opportunity
      // 1. Delete prior saved requirements
      await db
        .delete(requirements)
        .where(
          and(
            eq(requirements.opportunityId, input.opportunityId),
            eq(requirements.userId, ctx.actorId)
          )
        );

      // 2. Insert new requirements
      if (input.requirements.length > 0) {
        await db.insert(requirements).values(
          input.requirements.map((req, index) => ({
            id: req.id || crypto.randomUUID(),
            opportunityId: input.opportunityId,
            userId: ctx.actorId,
            title: req.title,
            category: req.category,
            jobDescriptionExcerpt: req.jobDescriptionExcerpt,
            orderIndex: index,
          }))
        );
      }

      return {
        success: true,
        count: input.requirements.length,
      };
    }),

  delete: protectedProcedure
    .input(deleteRequirementInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify requirement exists and belongs to user
      const [existing] = await db
        .select({ id: requirements.id })
        .from(requirements)
        .where(
          and(
            eq(requirements.id, input.id),
            eq(requirements.userId, ctx.actorId)
          )
        );

      if (!existing) {
        throw unavailableResource();
      }

      await db
        .delete(requirements)
        .where(
          and(
            eq(requirements.id, input.id),
            eq(requirements.userId, ctx.actorId)
          )
        );

      return {
        success: true,
        deletedId: input.id,
      };
    }),

  getDailyUsage: protectedProcedure.query(async ({ ctx }) => {
    return await getDailyUsage(ctx.actorId, "requirement_extraction");
  }),
});
