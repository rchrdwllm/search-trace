"use client";

import type { ReactNode } from "react";
import { ProgressProvider } from "@bprogress/next/app";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider
      color="var(--primary)"
      height="2px"
      options={{ showSpinner: false }}
      delay={100}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
