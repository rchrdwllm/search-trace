import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SummaryCounts } from "@/lib/validations/analysis";

export interface EvidenceContributionStats {
  citedEvidenceCount: number;
  totalEvidenceCount?: number;
  citedEvidenceTitles?: string[];
}

export interface AnalysisCoverageSummaryProps {
  counts: SummaryCounts;
  evidenceStats?: EvidenceContributionStats;
  className?: string;
}

export function AnalysisCoverageSummary({
  counts,
  evidenceStats,
  className,
}: AnalysisCoverageSummaryProps) {
  const cards = [
    {
      id: "supported",
      label: "Supported",
      count: counts.supported,
      icon: CheckCircle2,
      style:
        "border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200",
      badgeStyle: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
      description: "Direct proof in submitted materials",
    },
    {
      id: "weak",
      label: "Weak",
      count: counts.weak,
      icon: AlertTriangle,
      style:
        "border-amber-200 bg-amber-50/50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200",
      badgeStyle: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
      description: "Partial or introductory exposure",
    },
    {
      id: "missing",
      label: "Missing",
      count: counts.missing,
      icon: XCircle,
      style:
        "border-rose-200 bg-rose-50/50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-200",
      badgeStyle: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
      description: "Searched but not found in evidence",
    },
    {
      id: "unknown",
      label: "Unknown",
      count: counts.unknown,
      icon: HelpCircle,
      style:
        "border-slate-200 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-200",
      badgeStyle: "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
      description: "Insufficient context to evaluate",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4",
        className
      )}
      aria-label="Requirement coverage breakdown"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={cn(
              "flex flex-col justify-between rounded-xl border p-3.5 transition-colors sm:p-4",
              card.style
            )}
            data-testid={`coverage-count-${card.id}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider opacity-85 sm:text-sm">
                {card.label}
              </span>
              <Icon className="size-4 opacity-75 sm:size-5" aria-hidden="true" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                {card.count}
              </span>
              <span className="text-[11px] opacity-70">
                {counts.total > 0
                  ? `${Math.round((card.count / counts.total) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <p className="mt-1 text-[11px] opacity-75 line-clamp-1">
              {card.description}
            </p>
          </div>
        );
      })}

      {evidenceStats && (evidenceStats.citedEvidenceCount > 0 || (evidenceStats.totalEvidenceCount ?? 0) > 0) && (
        <div
          className="col-span-2 sm:col-span-4 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 sm:p-4 text-xs"
          data-testid="evidence-utilization-panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <FolderGit2 className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>Supporting Evidence Contribution:</span>
              <span className="text-primary font-semibold">
                {evidenceStats.citedEvidenceCount} of {evidenceStats.totalEvidenceCount ?? evidenceStats.citedEvidenceCount} attached items cited as proof
              </span>
            </div>
          </div>
          {evidenceStats.citedEvidenceTitles && evidenceStats.citedEvidenceTitles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-muted-foreground text-[11px]">Cited items:</span>
              {evidenceStats.citedEvidenceTitles.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-foreground shadow-xs border"
                >
                  {title}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
