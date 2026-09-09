import { router } from "@/trpc/init";
import { systemRouter } from "@/trpc/routers/system";
import { opportunityRouter } from "@/trpc/routers/opportunity";
import { resumeRouter } from "@/trpc/routers/resume";
import { requirementRouter } from "@/trpc/routers/requirement";
import { evidenceRouter } from "@/trpc/routers/evidence";
import { feedbackRouter } from "@/trpc/routers/feedback";
import { analysisRouter } from "@/trpc/routers/analysis";

export const appRouter = router({
  system: systemRouter,
  opportunity: opportunityRouter,
  resume: resumeRouter,
  requirement: requirementRouter,
  evidence: evidenceRouter,
  feedback: feedbackRouter,
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;
