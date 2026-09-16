import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisNextActionCardProps {
  text: string;
  targetRequirementTitle?: string | null;
  className?: string;
}

export function AnalysisNextActionCard({
  text,
  targetRequirementTitle,
  className,
}: AnalysisNextActionCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/20 bg-card p-5 shadow-sm sm:p-6",
        className
      )}
      data-testid="analysis-next-action-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Next Concrete Action
            </span>
            {targetRequirementTitle && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                targeting <strong className="font-medium text-foreground">{targetRequirementTitle}</strong>
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-normal tracking-tight text-foreground sm:text-xl">
            Focus Recommendation
          </h3>
        </div>
      </div>

      <p className="mt-3 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}
