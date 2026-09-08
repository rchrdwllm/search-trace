import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { opportunities, resumes } from "@/lib/db/schema";
import {
  resumeOpportunityInputSchema,
  setAiOptInInputSchema,
  updateReviewedTextInputSchema,
} from "@/lib/validations/resume";
import { protectedProcedure, router, unavailableResource } from "@/trpc/init";
import { getResumeStorageService } from "@/lib/storage/resume";
import { extractResumeText } from "@/lib/extraction/parser";

export const resumeRouter = router({
  getByOpportunityId: protectedProcedure
    .input(resumeOpportunityInputSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [record] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.opportunityId, input.opportunityId))
        .limit(1);

      return record ?? null;
    }),

  updateReviewedText: protectedProcedure
    .input(updateReviewedTextInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [record] = await db
        .update(resumes)
        .set({
          reviewedText: input.reviewedText.trim(),
          extractionState: "ready",
          updatedAt: new Date(),
        })
        .where(eq(resumes.opportunityId, input.opportunityId))
        .returning();

      if (!record) {
        unavailableResource();
      }

      return {
        success: true,
        reviewedText: record.reviewedText,
        extractionState: record.extractionState,
        updatedAt: record.updatedAt,
      };
    }),

  setAiOptIn: protectedProcedure
    .input(setAiOptInInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [record] = await db
        .update(resumes)
        .set({
          aiOptIn: input.enabled,
          updatedAt: new Date(),
        })
        .where(eq(resumes.opportunityId, input.opportunityId))
        .returning();

      if (!record) {
        unavailableResource();
      }

      return {
        success: true,
        aiOptIn: record.aiOptIn,
        updatedAt: record.updatedAt,
      };
    }),

  getDownloadUrl: protectedProcedure
    .input(resumeOpportunityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [record] = await db
        .select({ storagePath: resumes.storagePath })
        .from(resumes)
        .where(eq(resumes.opportunityId, input.opportunityId))
        .limit(1);

      if (!record) {
        unavailableResource();
      }

      const storage = getResumeStorageService();
      const downloadUrl = await storage.createSignedUrl(record.storagePath, 60);

      return {
        downloadUrl,
        expiresInSeconds: 60,
      };
    }),

  retryExtraction: protectedProcedure
    .input(resumeOpportunityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [record] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.opportunityId, input.opportunityId))
        .limit(1);

      if (!record) {
        unavailableResource();
      }

      const storage = getResumeStorageService();
      const buffer = await storage.downloadFile(record.storagePath);
      const fileType = record.fileType === "application/pdf" ? "pdf" : "docx";

      try {
        const { text } = await extractResumeText(buffer, fileType);
        const [updated] = await db
          .update(resumes)
          .set({
            extractedText: text,
            reviewedText: text,
            extractionState: "ready",
            updatedAt: new Date(),
          })
          .where(eq(resumes.id, record.id))
          .returning();

        return {
          success: true,
          extractionState: updated.extractionState,
          extractedText: updated.extractedText,
          reviewedText: updated.reviewedText,
        };
      } catch {
        const [failed] = await db
          .update(resumes)
          .set({
            extractionState: "failed",
            updatedAt: new Date(),
          })
          .where(eq(resumes.id, record.id))
          .returning();

        return {
          success: false,
          extractionState: failed.extractionState,
          extractedText: null,
          reviewedText: null,
        };
      }
    }),

  delete: protectedProcedure
    .input(resumeOpportunityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify opportunity ownership
      const [opportunity] = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        )
        .limit(1);

      if (!opportunity) {
        unavailableResource();
      }

      const [record] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.opportunityId, input.opportunityId))
        .limit(1);

      if (!record) {
        unavailableResource();
      }

      const storage = getResumeStorageService();
      try {
        await storage.deleteFile(record.storagePath);
      } catch {
        // Continue even if storage object was missing
      }

      await db.delete(resumes).where(eq(resumes.id, record.id));

      return { success: true };
    }),
});
