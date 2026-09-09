import "server-only";

import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "@/lib/db";
import {
  opportunities,
  requirements,
  resumes,
  opportunityEvidence,
  evidenceItems,
  feedbackItems,
} from "@/lib/db/schema";
import {
  getAnalysisPreFlightInputSchema,
  runAnalysisInputSchema,
  saveAnalysisInputSchema,
  getAnalysisSummaryInputSchema,
  type SummaryCounts,
} from "@/lib/validations/analysis";
import { protectedProcedure, router, unavailableResource } from "@/trpc/init";
import {
  assertWithinDailyLimit,
  getDailyUsage,
  incrementDailyUsage,
} from "@/lib/ai/rate-limiter";
import { getAiAnalyzerService } from "@/lib/ai";

export const analysisRouter = router({
  getPreFlight: protectedProcedure
    .input(getAnalysisPreFlightInputSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // 1. Verify opportunity ownership
      const [opp] = await db
        .select({ id: opportunities.id, userId: opportunities.userId })
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

      // 2. Fetch résumé status
      const [resume] = await db
        .select({
          id: resumes.id,
          extractionState: resumes.extractionState,
          aiOptIn: resumes.aiOptIn,
        })
        .from(resumes)
        .where(
          and(
            eq(resumes.opportunityId, input.opportunityId),
            eq(resumes.userId, ctx.actorId)
          )
        );

      // 3. Fetch approved requirements count
      const reqRows = await db
        .select({ id: requirements.id })
        .from(requirements)
        .where(
          and(
            eq(requirements.opportunityId, input.opportunityId),
            eq(requirements.userId, ctx.actorId)
          )
        );

      // 4. Fetch attached evidence items count and titles
      const attachedEvidence = await db
        .select({
          id: evidenceItems.id,
          title: evidenceItems.title,
        })
        .from(opportunityEvidence)
        .innerJoin(
          evidenceItems,
          eq(opportunityEvidence.evidenceItemId, evidenceItems.id)
        )
        .where(
          and(
            eq(opportunityEvidence.opportunityId, input.opportunityId),
            eq(opportunityEvidence.userId, ctx.actorId)
          )
        );

      // 5. Fetch opted-in feedback count
      const optedFeedback = await db
        .select({ id: feedbackItems.id })
        .from(feedbackItems)
        .where(
          and(
            eq(feedbackItems.opportunityId, input.opportunityId),
            eq(feedbackItems.userId, ctx.actorId),
            eq(feedbackItems.aiOptIn, true)
          )
        );

      // 6. Check daily usage
      const dailyUsage = await getDailyUsage(ctx.actorId, "evidence_gap_analysis");

      // 7. Evaluate readiness and collect reasons
      const reasons: string[] = [];

      if (reqRows.length === 0) {
        reasons.push("At least one approved requirement is required before running analysis.");
      }

      if (!resume) {
        reasons.push("A résumé has not been uploaded for this opportunity.");
      } else if (resume.extractionState !== "ready") {
        reasons.push("Résumé text extraction is still pending or failed.");
      } else if (!resume.aiOptIn) {
        reasons.push("AI opt-in consent must be enabled for the reviewed résumé.");
      }

      if (dailyUsage.remaining <= 0) {
        reasons.push("Daily analysis limit reached (5 requests/day). Quota resets at UTC midnight.");
      }

      return {
        isReady: reasons.length === 0,
        reasons,
        requirementsCount: reqRows.length,
        resumeStatus: {
          exists: Boolean(resume),
          extractionState: resume?.extractionState ?? null,
          aiOptIn: Boolean(resume?.aiOptIn),
        },
        selectedEvidenceCount: attachedEvidence.length,
        selectedEvidenceTitles: attachedEvidence.map((e) => e.title),
        optedInFeedbackCount: optedFeedback.length,
        dailyUsage,
      };
    }),

  run: protectedProcedure
    .input(runAnalysisInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // 1. Verify opportunity ownership
      const [opp] = await db
        .select({
          id: opportunities.id,
          userId: opportunities.userId,
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

      // 2. Verify résumé status and AI opt-in
      const [resume] = await db
        .select({
          id: resumes.id,
          extractionState: resumes.extractionState,
          extractedText: resumes.extractedText,
          reviewedText: resumes.reviewedText,
          aiOptIn: resumes.aiOptIn,
        })
        .from(resumes)
        .where(
          and(
            eq(resumes.opportunityId, input.opportunityId),
            eq(resumes.userId, ctx.actorId)
          )
        );

      if (!resume || resume.extractionState !== "ready") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reviewed résumé text must be in ready state to run analysis.",
        });
      }

      if (!resume.aiOptIn) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Explicit AI opt-in consent is required for the reviewed résumé.",
        });
      }

      const effectiveResumeText = (resume.reviewedText || resume.extractedText || "").trim();
      if (!effectiveResumeText) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reviewed résumé text is empty.",
        });
      }

      // 3. Verify requirements
      const reqRows = await db
        .select({
          id: requirements.id,
          title: requirements.title,
          category: requirements.category,
          jobDescriptionExcerpt: requirements.jobDescriptionExcerpt,
          orderIndex: requirements.orderIndex,
        })
        .from(requirements)
        .where(
          and(
            eq(requirements.opportunityId, input.opportunityId),
            eq(requirements.userId, ctx.actorId)
          )
        );

      if (reqRows.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one approved requirement is required to run analysis.",
        });
      }

      // 4. Check daily rate limit (5 analyses per day)
      await assertWithinDailyLimit(ctx.actorId, "evidence_gap_analysis");

      // 5. Gather only selected evidence items
      const attachedEvidence = await db
        .select({
          id: evidenceItems.id,
          title: evidenceItems.title,
          description: evidenceItems.description,
          type: evidenceItems.type,
          sourceUrl: evidenceItems.sourceUrl,
        })
        .from(opportunityEvidence)
        .innerJoin(
          evidenceItems,
          eq(opportunityEvidence.evidenceItemId, evidenceItems.id)
        )
        .where(
          and(
            eq(opportunityEvidence.opportunityId, input.opportunityId),
            eq(opportunityEvidence.userId, ctx.actorId)
          )
        );

      // 6. Gather only opted-in employer feedback
      const optedFeedback = await db
        .select({
          id: feedbackItems.id,
          feedbackDate: feedbackItems.feedbackDate,
          text: feedbackItems.text,
          sourceType: feedbackItems.sourceType,
          provenance: feedbackItems.provenance,
        })
        .from(feedbackItems)
        .where(
          and(
            eq(feedbackItems.opportunityId, input.opportunityId),
            eq(feedbackItems.userId, ctx.actorId),
            eq(feedbackItems.aiOptIn, true)
          )
        );

      // 7. Invoke AI Analyzer Service
      const analyzer = getAiAnalyzerService();
      const analysisResult = await analyzer.analyzeOpportunity({
        opportunityId: opp.id,
        jobDescription: opp.jobDescription,
        requirements: reqRows,
        resumeText: effectiveResumeText,
        evidenceItems: attachedEvidence,
        feedbackItems: optedFeedback,
      });

      // 8. Increment daily usage upon successful draft generation
      const dailyUsage = await incrementDailyUsage(
        ctx.actorId,
        "evidence_gap_analysis"
      );

      // 9. Calculate summary counts
      const summaryCounts: SummaryCounts = {
        supported: 0,
        weak: 0,
        missing: 0,
        unknown: 0,
        total: analysisResult.evaluations.length,
      };

      for (const ev of analysisResult.evaluations) {
        if (ev.coverageState in summaryCounts) {
          summaryCounts[ev.coverageState as keyof Omit<SummaryCounts, "total">]++;
        }
      }

      return {
        opportunityId: opp.id,
        evaluations: analysisResult.evaluations,
        nextAction: analysisResult.nextAction,
        limitations: analysisResult.limitations,
        summaryCounts,
        dailyUsage,
      };
    }),

  save: protectedProcedure
    .input(saveAnalysisInputSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // 1. Verify opportunity ownership
      const [opp] = await db
        .select({ id: opportunities.id, userId: opportunities.userId })
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

      const now = new Date();

      // 2. Persist confirmed coverage states and citations to requirements
      for (const reqItem of input.requirements) {
        await db
          .update(requirements)
          .set({
            coverageState: reqItem.coverageState,
            citationSource: reqItem.citationSource ?? null,
            citationExcerpt: reqItem.citationExcerpt ?? null,
            citationSourceTitle: reqItem.citationSourceTitle ?? null,
            missingEvidenceNotes: reqItem.missingEvidenceNotes ?? null,
            coverageRationale: reqItem.coverageRationale ?? null,
            updatedAt: now,
          })
          .where(
            and(
              eq(requirements.id, reqItem.id),
              eq(requirements.opportunityId, input.opportunityId),
              eq(requirements.userId, ctx.actorId)
            )
          );
      }

      // 3. Update opportunity with analysis timestamp, next action, and limitations
      await db
        .update(opportunities)
        .set({
          lastAnalyzedAt: now,
          nextActionText: input.nextAction.text,
          nextActionRequirementId: input.nextAction.targetRequirementId ?? null,
          analysisLimitations: input.limitations ?? null,
          updatedAt: now,
        })
        .where(
          and(
            eq(opportunities.id, input.opportunityId),
            eq(opportunities.userId, ctx.actorId)
          )
        );

      // 4. Calculate summary counts
      const summaryCounts: SummaryCounts = {
        supported: 0,
        weak: 0,
        missing: 0,
        unknown: 0,
        total: input.requirements.length,
      };

      for (const reqItem of input.requirements) {
        if (reqItem.coverageState in summaryCounts) {
          summaryCounts[reqItem.coverageState as keyof Omit<SummaryCounts, "total">]++;
        }
      }

      return {
        success: true as const,
        opportunityId: opp.id,
        lastAnalyzedAt: now.toISOString(),
        summaryCounts,
      };
    }),

  getSummary: protectedProcedure
    .input(getAnalysisSummaryInputSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // 1. Verify opportunity ownership
      const [opp] = await db
        .select({
          id: opportunities.id,
          userId: opportunities.userId,
          lastAnalyzedAt: opportunities.lastAnalyzedAt,
          nextActionText: opportunities.nextActionText,
          nextActionRequirementId: opportunities.nextActionRequirementId,
          analysisLimitations: opportunities.analysisLimitations,
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

      // 2. Fetch all requirements for this opportunity
      const reqRows = await db
        .select({
          id: requirements.id,
          title: requirements.title,
          category: requirements.category,
          jobDescriptionExcerpt: requirements.jobDescriptionExcerpt,
          coverageState: requirements.coverageState,
          citationSource: requirements.citationSource,
          citationExcerpt: requirements.citationExcerpt,
          citationSourceTitle: requirements.citationSourceTitle,
          missingEvidenceNotes: requirements.missingEvidenceNotes,
          coverageRationale: requirements.coverageRationale,
          orderIndex: requirements.orderIndex,
        })
        .from(requirements)
        .where(
          and(
            eq(requirements.opportunityId, input.opportunityId),
            eq(requirements.userId, ctx.actorId)
          )
        )
        .orderBy(requirements.orderIndex);

      // 3. Compute deterministic summary counts
      const summaryCounts: SummaryCounts = {
        supported: 0,
        weak: 0,
        missing: 0,
        unknown: 0,
        total: reqRows.length,
      };

      for (const req of reqRows) {
        if (req.coverageState && req.coverageState in summaryCounts) {
          summaryCounts[req.coverageState as keyof Omit<SummaryCounts, "total">]++;
        }
      }

      // 4. Resolve next action target title if requirement ID exists
      let targetRequirementTitle: string | null = null;
      if (opp.nextActionRequirementId) {
        const targetReq = reqRows.find((r) => r.id === opp.nextActionRequirementId);
        targetRequirementTitle = targetReq?.title || null;
      }

      const isAnalyzed = Boolean(opp.lastAnalyzedAt);

      return {
        isAnalyzed,
        lastAnalyzedAt: opp.lastAnalyzedAt ? opp.lastAnalyzedAt.toISOString() : null,
        summaryCounts,
        nextAction: opp.nextActionText
          ? {
              text: opp.nextActionText,
              targetRequirementId: opp.nextActionRequirementId ?? null,
              targetRequirementTitle,
            }
          : null,
        limitations: opp.analysisLimitations ?? null,
        requirements: reqRows,
      };
    }),

  getDailyUsage: protectedProcedure.query(async ({ ctx }) => {
    return getDailyUsage(ctx.actorId, "evidence_gap_analysis");
  }),
});
