import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";

export const systemRouter = router({
  health: publicProcedure.input(z.object({}).optional()).query(() => ({ status: "ok" as const })),
  session: protectedProcedure.input(z.object({}).optional()).query(({ ctx }) => ({
    authenticated: true as const,
    userId: ctx.actorId,
  })),
});
