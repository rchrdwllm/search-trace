import { router } from "@/trpc/init";
import { systemRouter } from "@/trpc/routers/system";
import { opportunityRouter } from "@/trpc/routers/opportunity";
import { resumeRouter } from "@/trpc/routers/resume";
import { requirementRouter } from "@/trpc/routers/requirement";

export const appRouter = router({
  system: systemRouter,
  opportunity: opportunityRouter,
  resume: resumeRouter,
  requirement: requirementRouter,
});

export type AppRouter = typeof appRouter;
