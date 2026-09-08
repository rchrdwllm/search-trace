import "server-only";

import { headers } from "next/headers";
import { appRouter } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/init";

/** Server Components call the router in-process; they never self-fetch /api/trpc. */
export async function getTRPCCaller() {
  return appRouter.createCaller(await createTRPCContext({ headers: await headers() }));
}
