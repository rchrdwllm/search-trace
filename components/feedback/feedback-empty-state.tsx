import { MessageSquareTextIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackEmptyStateProps {
  onAddFeedback?: () => void;
  title?: string;
  description?: string;
}

export function FeedbackEmptyState({
  onAddFeedback,
  title = "No employer feedback recorded",
  description = "Preserve recruiter comments, interview feedback, or rejection notes as reported signals without treating them as proven causality.",
}: FeedbackEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 text-center animate-in fade-in-50 sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessageSquareTextIcon className="size-6" aria-hidden="true" />
      </div>

      <div className="flex max-w-md flex-col gap-1.5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {onAddFeedback && (
        <Button onClick={onAddFeedback} className="mt-2">
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          Add Feedback
        </Button>
      )}
    </div>
  );
}
