"use client";

import "client-only";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState, type ReactNode } from "react";
import superjson from "superjson";
import type { AppRouter } from "@/trpc/routers/_app";
import { getQueryClient } from "@/trpc/query-client";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export function TRPCClientProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: `${getBaseUrl()}/api/trpc`, transformer: superjson })],
    }),
  );
  return <QueryClientProvider client={queryClient}><TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>{children}</TRPCProvider></QueryClientProvider>;
}
