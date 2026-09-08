"use client";

import { SparklesIcon, CheckIcon, XIcon, PlusIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequirementDraftBannerProps {
  count: number;
  onSave: () => void;
  onDiscard: () => void;
  onAdd: () => void;
  isSaving?: boolean;
}

export function RequirementDraftBanner({
  count,
  onSave,
  onDiscard,
  onAdd,
  isSaving = false,
}: RequirementDraftBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5 sm:mt-0">
          <SparklesIcon className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Reviewing Draft Requirements ({count})
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              Unsaved
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review, edit, add, or delete requirements before saving. Source records are not modified until saved.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={isSaving}
          className="text-xs h-8"
        >
          <PlusIcon className="size-3.5 mr-1" />
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          disabled={isSaving}
          className="text-xs text-muted-foreground hover:text-destructive h-8"
        >
          <XIcon className="size-3.5 mr-1" />
          Discard
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isSaving || count === 0}
          className="text-xs h-8"
        >
          {isSaving ? (
            <>
              <Loader2Icon className="size-3.5 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="size-3.5 mr-1" />
              Save Requirements
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
