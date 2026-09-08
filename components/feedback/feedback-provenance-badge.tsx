import { cn } from "@/lib/utils";
import type { FeedbackProvenance } from "@/lib/validations/feedback";
import { QuoteIcon, BookOpenIcon } from "lucide-react";

interface FeedbackProvenanceBadgeProps {
  provenance: FeedbackProvenance;
  className?: string;
}

export const feedbackProvenanceLabels: Record<FeedbackProvenance, string> = {
  exact_quote: "Exact Quote",
  personal_summary: "Personal Summary",
};

export function FeedbackProvenanceBadge({
  provenance,
  className,
}: FeedbackProvenanceBadgeProps) {
  const isQuote = provenance === "exact_quote";
  const label = feedbackProvenanceLabels[provenance] ?? provenance;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
        isQuote
          ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
          : "border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
        className,
      )}
    >
      {isQuote ? (
        <QuoteIcon className="size-3" aria-hidden="true" />
      ) : (
        <BookOpenIcon className="size-3" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
