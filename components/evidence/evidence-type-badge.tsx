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

export function EvidenceTypeBadge({ type, className }: EvidenceTypeBadgeProps) {
  const label = evidenceTypeLabels[type] ?? type;

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
