"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisCoverageSummary } from "./analysis-coverage-summary";
import { AnalysisRequirementItem } from "./analysis-requirement-item";
import {
  Sparkles,
  Save,
  Trash2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import type {
  RunAnalysisResponse,
  RequirementEvaluationDraft,
  CoverageState,
  SummaryCounts,
} from "@/lib/validations/analysis";

interface AnalysisDraftReviewProps {
  draft: RunAnalysisResponse;
  onSave: (
    updatedEvaluations: RequirementEvaluationDraft[],
    nextAction: { text: string; targetRequirementId?: string | null },
    limitations: string
  ) => void;
  onDiscard: () => void;
  isSaving: boolean;
  getEvidenceUrl?: (title?: string | null) => string | null;
  totalEvidenceCount?: number;
}

export function AnalysisDraftReview({
  draft,
  onSave,
  onDiscard,
  isSaving,
  getEvidenceUrl,
  totalEvidenceCount,
}: AnalysisDraftReviewProps) {
  const [evaluations, setEvaluations] = useState<RequirementEvaluationDraft[]>(
    draft.evaluations
  );
  const [nextActionText, setNextActionText] = useState(draft.nextAction.text);
  const [nextActionTargetId, setNextActionTargetId] = useState<string | null>(
    draft.nextAction.targetRequirementId || null
  );

  // Dynamically compute summary counts based on current client state
  const liveSummaryCounts: SummaryCounts = useMemo(() => {
    const counts: SummaryCounts = {
      supported: 0,
      weak: 0,
      missing: 0,
      unknown: 0,
      total: evaluations.length,
    };
    for (const ev of evaluations) {
      if (ev.coverageState in counts) {
        counts[ev.coverageState as keyof Omit<SummaryCounts, "total">]++;
      }
    }
    return counts;
  }, [evaluations]);

  const liveEvidenceStats = useMemo(() => {
    const citedTitles = Array.from(
      new Set(
        evaluations
          .filter((e) => e.citationSource === "evidence" && e.citationSourceTitle)
          .map((e) => e.citationSourceTitle!)
      )
    );
    return {
      citedEvidenceCount: citedTitles.length,
      totalEvidenceCount,
      citedEvidenceTitles: citedTitles,
    };
  }, [evaluations, totalEvidenceCount]);

  const handleOverrideState = (
    requirementId: string,
    newState: CoverageState
  ) => {
    setEvaluations((prev) =>
      prev.map((e) =>
        e.requirementId === requirementId
          ? {
              ...e,
              coverageState: newState,
              coverageRationale:
                e.coverageState !== newState
                  ? `Overridden by user from ${e.coverageState} to ${newState}.`
                  : e.coverageRationale,
            }
          : e
      )
    );
  };

  const handleSave = () => {
    onSave(
      evaluations,
      {
        text: nextActionText,
        targetRequirementId: nextActionTargetId,
      },
      draft.limitations
    );
  };

  return (
    <div
      className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card/60 p-4 sm:p-6 shadow-sm"
      data-testid="analysis-draft-review-workspace"
    >
      {/* Draft Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-bold text-foreground">
              Review Analysis Draft
            </h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Uncommitted Draft
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Review and adjust AI-suggested coverage states. Nothing is persisted to your opportunity until you save.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Discard Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 size-3.5" />
                Save Assessment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Dynamic Summary Counts */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Coverage Breakdown (Adjusts as you edit)
        </h4>
        <AnalysisCoverageSummary counts={liveSummaryCounts} evidenceStats={liveEvidenceStats} />
      </div>

      {/* Next Action Review / Edit */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Proposed Next Concrete Action
          </span>
          <span className="text-xs text-muted-foreground">Exactly 1 bounded task</span>
        </div>
        <textarea
          value={nextActionText}
          onChange={(e) => setNextActionText(e.target.value)}
          rows={3}
          className="w-full rounded-lg border bg-background p-3 text-sm leading-relaxed text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Enter a concrete, bounded action to improve your application materials..."
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Target requirement:</span>
            <select
              value={nextActionTargetId || ""}
              onChange={(e) => setNextActionTargetId(e.target.value || null)}
              className="rounded border bg-background px-2 py-1 text-xs text-foreground"
            >
              {evaluations.map((e) => (
                <option key={e.requirementId} value={e.requirementId}>
                  [{e.coverageState.toUpperCase()}] {e.requirementTitle}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-muted-foreground/80">
            {nextActionText.length}/500 chars
          </span>
        </div>
      </div>

      {/* Requirements Review List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evaluated Requirements ({evaluations.length})
          </h4>
          <span className="text-xs text-muted-foreground">
            Click coverage buttons to override states
          </span>
        </div>

        <div className="space-y-3">
          {evaluations.map((evalItem) => (
            <AnalysisRequirementItem
              key={evalItem.requirementId}
              id={evalItem.requirementId}
              title={evalItem.requirementTitle}
              category={evalItem.category}
              jobDescriptionExcerpt={evalItem.jobDescriptionExcerpt}
              coverageState={evalItem.coverageState}
              citationSource={evalItem.citationSource}
              citationExcerpt={evalItem.citationExcerpt}
              citationSourceTitle={evalItem.citationSourceTitle}
              citationSourceUrl={getEvidenceUrl ? getEvidenceUrl(evalItem.citationSourceTitle) : null}
              missingEvidenceNotes={evalItem.missingEvidenceNotes}
              coverageRationale={evalItem.coverageRationale}
              isEditable={true}
              onOverrideState={(newState) =>
                handleOverrideState(evalItem.requirementId, newState)
              }
            />
          ))}
        </div>
      </div>

      {/* Footer Callout */}
      <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-primary" />
          <span>Constitution Principle II: AI output begins as a draft; your confirmed choices are the system of record.</span>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
        >
          {isSaving ? "Saving..." : "Confirm & Save Assessment"}
        </Button>
      </div>
    </div>
  );
}
