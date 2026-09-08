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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
        <MessageSquareTextIcon className="size-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">
        {description}
      </p>

      {onAddFeedback && (
        <Button onClick={onAddFeedback} size="sm" className="gap-1.5">
          <PlusIcon className="size-4" aria-hidden="true" />
          Add Feedback
        </Button>
      )}
    </div>
  );
}
