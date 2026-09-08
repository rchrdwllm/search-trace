import { cn } from "@/lib/utils";
import type { FeedbackSourceType } from "@/lib/validations/feedback";

interface FeedbackSourceBadgeProps {
  sourceType: FeedbackSourceType;
  className?: string;
}

export const feedbackSourceLabels: Record<FeedbackSourceType, string> = {
  recruiter_feedback: "Recruiter Feedback",
  rejection_note: "Rejection Note",
  interview_feedback: "Interview Feedback",
  user_summary: "User Summary",
};

const sourceStyles: Record<FeedbackSourceType, string> = {
  recruiter_feedback:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  rejection_note:
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700",
  interview_feedback:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  user_summary:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
};

export function FeedbackSourceBadge({
  sourceType,
  className,
}: FeedbackSourceBadgeProps) {
  const label = feedbackSourceLabels[sourceType] ?? sourceType;
  const style =
    sourceStyles[sourceType] ?? "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
