import "server-only";

import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

export const safeErrorCodes = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "NOT_FOUND",
  "CONFLICT",
  "TOO_MANY_REQUESTS",
  "INTERNAL_SERVER_ERROR",
] as const;

export type SafeErrorCode = (typeof safeErrorCodes)[number];

export async function createTRPCContext({ headers }: { headers: Headers }) {
  const session = await auth.api.getSession({ headers });
  return {
    requestId: headers.get("x-request-id") ?? crypto.randomUUID(),
    session,
    actorId: session?.user.id ?? null,
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

function redactError(error: unknown) {
  // Never include inputs, cookies, session values, causes, or stack traces in logs.
  const code = error instanceof TRPCError ? error.code : "INTERNAL_SERVER_ERROR";
  console.error("tRPC request failed", { code });
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    redactError(error);
    const safeCode: SafeErrorCode = safeErrorCodes.includes(
      error.code as SafeErrorCode,
    )
      ? (error.code as SafeErrorCode)
      : "INTERNAL_SERVER_ERROR";
    const message =
      safeCode === "INTERNAL_SERVER_ERROR"
        ? "Unable to complete that request. Please try again."
        : shape.message;
    const fieldErrors =
      error.cause instanceof ZodError ? error.cause.flatten().fieldErrors : undefined;

    return {
      ...shape,
      code: safeCode,
      message,
      data: {
        code: safeCode,
        httpStatus: shape.data.httpStatus,
        path: shape.data.path,
        fieldErrors,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.actorId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please sign in to continue." });
  }
  return next({ ctx: { ...ctx, actorId: ctx.actorId } });
});

/** Use this at repository seams so missing and foreign private records are indistinguishable. */
export function unavailableResource(): never {
  throw new TRPCError({ code: "NOT_FOUND", message: "The requested resource is unavailable." });
}
