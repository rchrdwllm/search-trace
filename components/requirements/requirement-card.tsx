"use client";

import { PencilIcon, Trash2Icon, QuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  requirementCategoryLabels,
  type RequirementCategory,
} from "@/lib/validations/requirement";

interface RequirementCardProps {
  id?: string;
  title: string;
  category: RequirementCategory;
  jobDescriptionExcerpt: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDraft?: boolean;
}

export function RequirementCard({
  title,
  category,
  jobDescriptionExcerpt,
  onEdit,
  onDelete,
  isDraft = false,
}: RequirementCardProps) {
  const categoryLabel = requirementCategoryLabels[category] ?? category;

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-border/80">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs tracking-wide text-muted-foreground">
              {categoryLabel}
            </span>
            {isDraft && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onEdit}
                aria-label={`Edit requirement: ${title}`}
                className="text-muted-foreground hover:text-foreground size-7"
              >
                <PencilIcon className="size-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onDelete}
                aria-label={`Delete requirement: ${title}`}
                className="text-muted-foreground hover:text-destructive size-7"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        <h4 className="text-sm font-semibold text-foreground leading-snug whitespace-pre-wrap">
          {title}
        </h4>

        {jobDescriptionExcerpt && (
          <blockquote className="mt-2 flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <QuoteIcon className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/60 rotate-180" />
            <span className="italic leading-relaxed whitespace-pre-wrap line-clamp-3 hover:line-clamp-none transition-all">
              &ldquo;{jobDescriptionExcerpt}&rdquo;
            </span>
          </blockquote>
        )}
      </div>
    </div>
  );
}
