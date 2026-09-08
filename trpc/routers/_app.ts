import { router } from "@/trpc/init";
import { systemRouter } from "@/trpc/routers/system";

export const appRouter = router({ system: systemRouter });
export type AppRouter = typeof appRouter;
