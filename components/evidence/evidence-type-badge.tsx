import { cn } from "@/lib/utils";
import type { EvidenceType } from "@/lib/validations/evidence";

interface EvidenceTypeBadgeProps {
  type: EvidenceType;
  className?: string;
}

export const evidenceTypeLabels: Record<EvidenceType, string> = {
  project: "Project",
  accomplishment: "Accomplishment",
  portfolio_link: "Portfolio Link",
};

const typeStyles: Record<EvidenceType, string> = {
  project:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  accomplishment:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  portfolio_link:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
};

export function EvidenceTypeBadge({ type, className }: EvidenceTypeBadgeProps) {
  const label = evidenceTypeLabels[type] ?? type;
  const style = typeStyles[type] ?? "bg-muted text-muted-foreground border-border";

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
