"use client";

import { SparklesIcon, AlertCircleIcon } from "lucide-react";

interface RequirementQuotaAlertProps {
  used: number;
  limit: number;
  remaining: number;
  resetsAt?: string;
}

export function RequirementQuotaAlert({
  used,
  limit,
  remaining,
  resetsAt,
}: RequirementQuotaAlertProps) {
  const isExhausted = remaining <= 0;

  if (isExhausted) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-900 dark:text-amber-200"
      >
        <AlertCircleIcon className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="font-medium">Daily AI Extraction Limit Reached</p>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90">
            You have used all {limit} of your daily extraction requests. The limit resets at midnight UTC
            {resetsAt ? ` (${new Date(resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}.
            You can still add, edit, or delete requirements manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground px-1">
      <span className="inline-flex items-center gap-1.5">
        <SparklesIcon className="size-3.5 text-primary" />
        <span>Gemini 3.6 Flash requirement analysis</span>
      </span>
      <span>
        {remaining} of {limit} extractions remaining today ({used} used)
      </span>
    </div>
  );
}
