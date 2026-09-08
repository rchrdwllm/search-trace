import { router } from "@/trpc/init";
import { systemRouter } from "@/trpc/routers/system";
import { opportunityRouter } from "@/trpc/routers/opportunity";

export const appRouter = router({
  system: systemRouter,
  opportunity: opportunityRouter,
});

export type AppRouter = typeof appRouter;
