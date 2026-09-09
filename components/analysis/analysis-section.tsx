"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AnalysisCoverageSummary } from "./analysis-coverage-summary";
import { AnalysisNextActionCard } from "./analysis-next-action-card";
import { AnalysisRequirementItem } from "./analysis-requirement-item";
import { AnalysisPreflightDialog } from "./analysis-preflight-dialog";
import { AnalysisDraftReview } from "./analysis-draft-review";
import type {
  RunAnalysisResponse,
  RequirementEvaluationDraft,
} from "@/lib/validations/analysis";

interface AnalysisSectionProps {
  opportunityId: string;
  className?: string;
}

export function AnalysisSection({
  opportunityId,
  className,
}: AnalysisSectionProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isPreflightOpen, setIsPreflightOpen] = useState(false);
  const [activeDraft, setActiveDraft] = useState<RunAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const summaryQueryOptions = trpc.analysis.getSummary.queryOptions({ opportunityId });
  const summaryQuery = useQuery(summaryQueryOptions);

  const preflightQueryOptions = trpc.analysis.getPreFlight.queryOptions(
    { opportunityId },
    { enabled: isPreflightOpen }
  );
  const preflightQuery = useQuery(preflightQueryOptions);

  const dailyUsageQueryOptions = trpc.analysis.getDailyUsage.queryOptions();
  const dailyUsageQuery = useQuery(dailyUsageQueryOptions);

  const evidenceQueryOptions = trpc.evidence.listByOpportunityId.queryOptions({ opportunityId });
  const evidenceQuery = useQuery(evidenceQueryOptions);

  // Mutations
  const runMutation = useMutation(
    trpc.analysis.run.mutationOptions({
      onSuccess: (data) => {
        setActiveDraft(data);
        setIsPreflightOpen(false);
        setErrorMessage(null);
        void queryClient.invalidateQueries(
          trpc.analysis.getDailyUsage.queryFilter()
        );
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to run analysis. Please try again.");
      },
    })
  );

  const saveMutation = useMutation(
    trpc.analysis.save.mutationOptions({
      onSuccess: () => {
        setActiveDraft(null);
        setErrorMessage(null);
        void queryClient.invalidateQueries(
          trpc.analysis.getSummary.queryFilter({ opportunityId })
        );
        void queryClient.invalidateQueries(
          trpc.analysis.getPreFlight.queryFilter({ opportunityId })
        );
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to save assessment. Please try again.");
      },
    })
  );

  const handleStartAnalysis = () => {
    setErrorMessage(null);
    runMutation.mutate({ opportunityId });
  };

  const handleSaveDraft = (
    evaluations: RequirementEvaluationDraft[],
    nextAction: { text: string; targetRequirementId?: string | null },
    limitations: string
  ) => {
    saveMutation.mutate({
      opportunityId,
      requirements: evaluations.map((e) => ({
        id: e.requirementId,
        coverageState: e.coverageState,
        citationSource: e.citationSource,
        citationExcerpt: e.citationExcerpt,
        citationSourceTitle: e.citationSourceTitle,
        missingEvidenceNotes: e.missingEvidenceNotes,
        coverageRationale: e.coverageRationale,
      })),
      nextAction: {
        text: nextAction.text,
        targetRequirementId: nextAction.targetRequirementId,
      },
      limitations,
    });
  };

  const handleDiscardDraft = () => {
    setActiveDraft(null);
    setErrorMessage(null);
  };

  const summary = summaryQuery.data;
  const isAnalyzed = summary?.isAnalyzed ?? false;
  const dailyUsage = dailyUsageQuery.data;

  const attachedEvidenceItems = evidenceQuery.data?.selected ?? [];

  const getEvidenceUrl = (citationSourceTitle?: string | null) => {
    if (!citationSourceTitle || attachedEvidenceItems.length === 0) return null;
    const cleanTitle = citationSourceTitle.replace(/^project:\s*/i, "").trim().toLowerCase();
    const match = attachedEvidenceItems.find(
      (e) =>
        e.title.trim().toLowerCase() === cleanTitle ||
        cleanTitle.includes(e.title.trim().toLowerCase()) ||
        e.title.trim().toLowerCase().includes(cleanTitle)
    );
    return match?.sourceUrl ?? null;
  };

  const citedEvidenceTitles = Array.from(
    new Set(
      (summary?.requirements ?? [])
        .filter((r) => r.citationSource === "evidence" && r.citationSourceTitle)
        .map((r) => r.citationSourceTitle!)
    )
  );

  const evidenceStats = {
    citedEvidenceCount: citedEvidenceTitles.length,
    totalEvidenceCount: attachedEvidenceItems.length,
    citedEvidenceTitles,
  };

  return (
    <section
      aria-labelledby="analysis-section-heading"
      className={className}
      data-testid="analysis-section"
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="h-7 text-xs"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quota Exhausted Warning */}
        {dailyUsage && dailyUsage.remaining <= 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Daily Analysis Quota Reached</AlertTitle>
            <AlertDescription>
              You have used all {dailyUsage.limit} analysis requests for today. Quota resets at UTC midnight.
            </AlertDescription>
          </Alert>
        )}

        {/* State 1: Active Draft Review Mode */}
        {activeDraft ? (
          <AnalysisDraftReview
            draft={activeDraft}
            onSave={handleSaveDraft}
            onDiscard={handleDiscardDraft}
            isSaving={saveMutation.isPending}
            getEvidenceUrl={getEvidenceUrl}
            totalEvidenceCount={attachedEvidenceItems.length}
          />
        ) : isAnalyzed && summary ? (
          /* State 2: Analyzed & Confirmed View */
          <div className="space-y-6" data-testid="analyzed-view">
            {/* Header / Re-run Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2
                    id="analysis-section-heading"
                    className="text-xl font-bold tracking-tight text-foreground"
                  >
                    Evidence-Gap Analysis
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="size-3" />
                    Assessed
                  </span>
                </div>
                {summary.lastAnalyzedAt && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Last evaluated on {new Date(summary.lastAnalyzedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPreflightOpen(true)}
                disabled={runMutation.isPending || (dailyUsage && dailyUsage.remaining <= 0)}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Re-run Analysis
              </Button>
            </div>

            {/* Coverage Summary Cards */}
            <AnalysisCoverageSummary counts={summary.summaryCounts} evidenceStats={evidenceStats} />

            {/* Next Action Card */}
            {summary.nextAction && (
              <AnalysisNextActionCard
                text={summary.nextAction.text}
                targetRequirementTitle={summary.nextAction.targetRequirementTitle}
              />
            )}

            {/* Detailed Requirement Evaluation List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  Qualification Evidence Status ({summary.requirements.length})
                </h3>
              </div>
              <div className="space-y-3">
                {summary.requirements.map((req) => (
                  <AnalysisRequirementItem
                    key={req.id}
                    id={req.id}
                    title={req.title}
                    category={req.category}
                    jobDescriptionExcerpt={req.jobDescriptionExcerpt}
                    coverageState={req.coverageState}
                    citationSource={req.citationSource}
                    citationExcerpt={req.citationExcerpt}
                    citationSourceTitle={req.citationSourceTitle}
                    citationSourceUrl={getEvidenceUrl(req.citationSourceTitle)}
                    missingEvidenceNotes={req.missingEvidenceNotes}
                    coverageRationale={req.coverageRationale}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* State 3: Unanalyzed Callout View */
          <div
            className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 text-center sm:p-8"
            data-testid="unanalyzed-view"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-6" aria-hidden="true" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3
                id="analysis-section-heading"
                className="text-lg font-bold text-foreground"
              >
                Evaluate Your Evidence Gap
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compare your approved role requirements against your reviewed résumé and selected evidence. SearchTrace extracts verbatim citations and provides one concrete action to improve before applying.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsPreflightOpen(true)}
              disabled={runMutation.isPending || (dailyUsage && dailyUsage.remaining <= 0)}
              className="mt-2"
            >
              <Sparkles className="mr-2 size-4" />
              Run Evidence-Gap Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Pre-Flight Transparency Dialog */}
      <AnalysisPreflightDialog
        open={isPreflightOpen}
        onOpenChange={setIsPreflightOpen}
        opportunityId={opportunityId}
        preFlightData={preflightQuery.data}
        isLoadingPreflight={preflightQuery.isLoading}
        onStartAnalysis={handleStartAnalysis}
        isAnalyzing={runMutation.isPending}
      />
    </section>
  );
}
