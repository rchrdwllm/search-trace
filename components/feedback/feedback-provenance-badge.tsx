import { cn } from "@/lib/utils";
import type { FeedbackProvenance } from "@/lib/validations/feedback";

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
  const label = feedbackProvenanceLabels[provenance] ?? provenance;

  return (
    <span
      className={cn(
        "font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
