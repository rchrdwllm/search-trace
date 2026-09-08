"use client";

import { SparklesIcon, PlusIcon, Loader2Icon, ListFilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequirementEmptyStateProps {
  onExtract: () => void;
  onAdd: () => void;
  isExtracting?: boolean;
  disabled?: boolean;
  quotaExhausted?: boolean;
}

export function RequirementEmptyState({
  onExtract,
  onAdd,
  isExtracting = false,
  disabled = false,
  quotaExhausted = false,
}: RequirementEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card/40">
      <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
        {isExtracting ? (
          <Loader2Icon className="size-6 animate-spin" />
        ) : (
          <ListFilterIcon className="size-6" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-foreground">No Requirements Extracted</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
        Extract 5 to 12 key qualifications and responsibilities directly from the job description with
        verbatim citations using Gemini 3.6 Flash, or add them manually.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={onExtract}
          disabled={disabled || isExtracting || quotaExhausted}
          className="text-xs h-9"
        >
          {isExtracting ? (
            <>
              <Loader2Icon className="size-4 mr-2 animate-spin" />
              Extracting with Gemini 3.6 Flash...
            </>
          ) : (
            <>
              <SparklesIcon className="size-4 mr-2" />
              Extract Requirements
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          disabled={disabled || isExtracting}
          className="text-xs h-9"
        >
          <PlusIcon className="size-4 mr-1.5" />
          Add Manually
        </Button>
      </div>

      {quotaExhausted && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Daily extraction limit reached. You can still add requirements manually.
        </p>
      )}
    </div>
  );
}
