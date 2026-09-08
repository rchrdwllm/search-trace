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

const categoryStyles: Record<RequirementCategory, string> = {
  technical_skill: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  experience: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  education: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  responsibility: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

export function RequirementCard({
  title,
  category,
  jobDescriptionExcerpt,
  onEdit,
  onDelete,
  isDraft = false,
}: RequirementCardProps) {
  const categoryLabel = requirementCategoryLabels[category] ?? category;
  const badgeClass = categoryStyles[category] ?? categoryStyles.other;

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 shadow-2xs transition-colors hover:border-border/80">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
            >
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
          <blockquote className="mt-2 flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground border-l-2 border-primary/40">
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
