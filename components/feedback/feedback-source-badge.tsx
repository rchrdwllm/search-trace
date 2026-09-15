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

export function FeedbackSourceBadge({
  sourceType,
  className,
}: FeedbackSourceBadgeProps) {
  const label = feedbackSourceLabels[sourceType] ?? sourceType;

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
