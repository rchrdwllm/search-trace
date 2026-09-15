import { Quote, FileText, FolderGit2, MessageSquare, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisCoverageBadge } from "./analysis-coverage-badge";
import {
  requirementCategoryLabels,
  type RequirementCategory,
} from "@/lib/validations/requirement";
import {
  citationSourceLabels,
  type CoverageState,
  type CitationSource,
} from "@/lib/validations/analysis";

export interface AnalysisRequirementItemProps {
  id: string;
  title: string;
  category: RequirementCategory;
  jobDescriptionExcerpt: string;
  coverageState?: CoverageState | null;
  citationSource?: CitationSource | null;
  citationExcerpt?: string | null;
  citationSourceTitle?: string | null;
  citationSourceUrl?: string | null;
  missingEvidenceNotes?: string | null;
  coverageRationale?: string | null;
  onOverrideState?: (newState: CoverageState) => void;
  isEditable?: boolean;
  className?: string;
}

const sourceIcons: Record<CitationSource, typeof FileText> = {
  resume: FileText,
  evidence: FolderGit2,
  feedback: MessageSquare,
};

export function AnalysisRequirementItem({
  title,
  category,
  jobDescriptionExcerpt,
  coverageState,
  citationSource,
  citationExcerpt,
  citationSourceTitle,
  citationSourceUrl,
  missingEvidenceNotes,
  coverageRationale,
  onOverrideState,
  isEditable = false,
  className,
}: AnalysisRequirementItemProps) {
  const SourceIcon = citationSource ? sourceIcons[citationSource] : FileText;
  const sourceLabel = citationSource
    ? citationSourceTitle || citationSourceLabels[citationSource]
    : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:border-foreground/20 sm:p-5",
        coverageState === "supported" && "border-emerald-200/60 dark:border-emerald-900/40",
        coverageState === "weak" && "border-amber-200/60 dark:border-amber-900/40",
        coverageState === "missing" && "border-rose-200/60 dark:border-rose-900/40",
        coverageState === "unknown" && "border-slate-200/60 dark:border-slate-800/40",
        className
      )}
      data-testid="analysis-requirement-item"
    >
      {/* Header: Title, Category & Coverage Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-muted-foreground">
              {requirementCategoryLabels[category] ?? category}
            </span>
            <AnalysisCoverageBadge state={coverageState} />
          </div>
          <h4 className="text-base font-semibold leading-snug text-foreground whitespace-pre-wrap">
            {title}
          </h4>
        </div>

        {/* Optional interactive override buttons during draft review */}
        {isEditable && onOverrideState && (
          <div className="flex items-center gap-1 shrink-0 pt-1 sm:pt-0">
            {(["supported", "weak", "missing", "unknown"] as CoverageState[]).map(
              (state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => onOverrideState(state)}
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium transition-colors",
                    coverageState === state
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                  aria-pressed={coverageState === state}
                >
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Cited Job Description Excerpt */}
      <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/80">Requirement Excerpt (Job Description): </span>
        <span className="italic whitespace-pre-wrap">&quot;{jobDescriptionExcerpt}&quot;</span>
      </div>

      {/* Candidate Verbatim Citation (Supported / Weak) */}
      {(coverageState === "supported" || coverageState === "weak") && citationExcerpt && (
        <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/30 p-3 text-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between pb-1.5 text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Quote className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Verbatim Citation:</span>
            </div>
            {sourceLabel && (
              citationSourceUrl ? (
                <a
                  href={citationSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-emerald-100/70 px-1.5 py-0.5 text-[11px] font-medium text-emerald-900 hover:underline dark:bg-emerald-900/60 dark:text-emerald-200"
                  data-testid="evidence-citation-link"
                >
                  <SourceIcon className="size-3" aria-hidden="true" />
                  {sourceLabel}
                  <ExternalLink className="size-2.5 opacity-70" aria-hidden="true" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-100/70 px-1.5 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                  <SourceIcon className="size-3" aria-hidden="true" />
                  {sourceLabel}
                </span>
              )
            )}
          </div>
          <p className="italic text-foreground/90 whitespace-pre-wrap">
            &quot;{citationExcerpt}&quot;
          </p>
        </div>
      )}

      {/* Missing Evidence Notes */}
      {coverageState === "missing" && missingEvidenceNotes && (
        <div className="rounded-lg border border-rose-200/70 bg-rose-50/30 p-3 text-xs text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200">
          <div className="flex items-center gap-1.5 font-medium pb-1 text-rose-800 dark:text-rose-300">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Missing Evidence Details:</span>
          </div>
          <p className="whitespace-pre-wrap">{missingEvidenceNotes}</p>
        </div>
      )}

      {/* General or Unknown Rationale */}
      {coverageRationale && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
          <span className="font-medium text-foreground/80">Evaluation Notes: </span>
          {coverageRationale}
        </p>
      )}
    </div>
  );
}
