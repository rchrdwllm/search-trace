"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  FileText,
  FolderGit2,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { AnalysisPreFlightResponse } from "@/lib/validations/analysis";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AnalysisPreflightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  preFlightData?: AnalysisPreFlightResponse;
  isLoadingPreflight: boolean;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
}

export function AnalysisPreflightDialog({
  open,
  onOpenChange,
  opportunityId,
  preFlightData,
  isLoadingPreflight,
  onStartAnalysis,
  isAnalyzing,
}: AnalysisPreflightDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isOptingIn, setIsOptingIn] = useState(false);

  const optInMutation = useMutation(
    trpc.resume.setAiOptIn.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.analysis.getPreFlight.queryFilter({ opportunityId })
        );
        void queryClient.invalidateQueries(
          trpc.resume.getByOpportunityId.queryFilter({ opportunityId })
        );
        setIsOptingIn(false);
      },
      onError: () => {
        setIsOptingIn(false);
      },
    })
  );

  const handleEnableResumeOptIn = () => {
    setIsOptingIn(true);
    optInMutation.mutate({
      opportunityId,
      enabled: true,
    });
  };

  const isReady = preFlightData?.isReady ?? false;
  const reasons = preFlightData?.reasons ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <DialogTitle>Start Evidence-Gap Analysis</DialogTitle>
          </div>
          <DialogDescription>
            Review the sources included in this AI-assisted qualification assessment.
          </DialogDescription>
        </DialogHeader>

        {isLoadingPreflight ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">Checking analysis prerequisites...</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Prerequisite Warnings */}
            {!isReady && reasons.length > 0 && (
              <Alert variant="destructive" className="text-xs">
                <AlertTriangle className="size-4" />
                <AlertTitle className="text-xs font-semibold">Prerequisites Required</AlertTitle>
                <AlertDescription className="mt-1 space-y-1">
                  {reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                  {preFlightData?.resumeStatus.exists &&
                    !preFlightData.resumeStatus.aiOptIn && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEnableResumeOptIn}
                          disabled={isOptingIn}
                          className="h-7 text-xs"
                        >
                          {isOptingIn ? "Enabling..." : "Enable Résumé AI Opt-In"}
                        </Button>
                      </div>
                    )}
                </AlertDescription>
              </Alert>
            )}

            {/* Source Disclosure Box */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Authorized Input Sources
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Pasted Job Description</strong> (Role requirements baseline)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span>
                    <strong>Reviewed Résumé Text</strong> (
                    {preFlightData?.resumeStatus.aiOptIn ? (
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        Opted-in & verified
                      </span>
                    ) : (
                      <span className="text-destructive font-medium">Opt-in pending</span>
                    )}
                    )
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FolderGit2 className="size-4 shrink-0 text-primary" />
                  <span>
                    <strong>Attached Supporting Evidence:</strong>{" "}
                    {preFlightData?.selectedEvidenceCount ?? 0} items selected
                  </span>
                </li>
                {preFlightData && preFlightData.optedInFeedbackCount > 0 && (
                  <li className="flex items-center gap-2">
                    <MessageSquare className="size-4 shrink-0 text-primary" />
                    <span>
                      <strong>Opted-In Employer Feedback:</strong>{" "}
                      {preFlightData.optedInFeedbackCount} items included
                    </span>
                  </li>
                )}
              </ul>
              <div className="border-t pt-2 text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
                <span>Unselected evidence library items and non-opted feedback are excluded.</span>
              </div>
            </div>

            {/* Daily Quota Notice */}
            {preFlightData && (
              <div className="flex items-center justify-between rounded-lg bg-card border px-3 py-2 text-xs text-muted-foreground">
                <span>Daily Quota</span>
                <span className="font-medium text-foreground">
                  {preFlightData.dailyUsage.remaining} of {preFlightData.dailyUsage.limit} remaining
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAnalyzing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onStartAnalysis}
            disabled={!isReady || isAnalyzing || isLoadingPreflight}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Analyzing Materials...
              </>
            ) : (
              "Start Analysis"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
