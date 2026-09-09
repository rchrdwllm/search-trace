import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  coverageStateLabels,
  type CoverageState,
} from "@/lib/validations/analysis";

interface AnalysisCoverageBadgeProps {
  state: CoverageState | null | undefined;
  className?: string;
  showIcon?: boolean;
}

const stateStyles: Record<CoverageState, string> = {
  supported:
    "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  weak:
    "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  missing:
    "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  unknown:
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700",
};

const stateIcons: Record<CoverageState, typeof CheckCircle2> = {
  supported: CheckCircle2,
  weak: AlertTriangle,
  missing: XCircle,
  unknown: HelpCircle,
};

export function AnalysisCoverageBadge({
  state,
  className,
  showIcon = true,
}: AnalysisCoverageBadgeProps) {
  if (!state) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-dashed border-border px-2 py-0.5 text-xs font-medium text-muted-foreground",
          className
        )}
      >
        Unassessed
      </span>
    );
  }

  const label = coverageStateLabels[state] ?? state;
  const style = stateStyles[state] ?? "bg-muted text-muted-foreground border-border";
  const Icon = stateIcons[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
        style,
        className
      )}
      role="status"
    >
      {showIcon && Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}
