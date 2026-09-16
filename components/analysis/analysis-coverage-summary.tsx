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
      description: "Direct proof in submitted materials",
    },
    {
      id: "weak",
      label: "Weak",
      count: counts.weak,
      icon: AlertTriangle,
      description: "Partial or introductory exposure",
    },
    {
      id: "missing",
      label: "Missing",
      count: counts.missing,
      icon: XCircle,
      description: "Searched but not found in evidence",
    },
    {
      id: "unknown",
      label: "Unknown",
      count: counts.unknown,
      icon: HelpCircle,
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
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 text-foreground transition-colors sm:p-4"
            data-testid={`coverage-count-${card.id}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-foreground sm:text-sm">
                {card.label}
              </span>
              <Icon className="size-4 text-muted-foreground sm:size-5" aria-hidden="true" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {card.count}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {counts.total > 0
                  ? `${Math.round((card.count / counts.total) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              {card.description}
            </p>
          </div>
        );
      })}

      {evidenceStats && (evidenceStats.citedEvidenceCount > 0 || (evidenceStats.totalEvidenceCount ?? 0) > 0) && (
        <div
          className="col-span-2 flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5 text-xs text-foreground sm:col-span-4 sm:p-4"
          data-testid="evidence-utilization-panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <FolderGit2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>Supporting Evidence Contribution:</span>
              <span className="font-semibold text-foreground">
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
