import type { OpportunityStatus } from "@/lib/validations/opportunity";
import { cn } from "cn";

interface OpportunityStatusBadgeProps {
  status: OpportunityStatus;
  className?: string;
}

const statusConfig: Record<
  OpportunityStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  applied: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  interviewing: {
    label: "Interviewing",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  },
  closed: {
    label: "Closed",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  },
};

export function OpportunityStatusBadge({
  status,
  className,
}: OpportunityStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
