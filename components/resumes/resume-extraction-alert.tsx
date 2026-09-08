"use client";

import { AlertCircleIcon, RefreshCwIcon, FileEditIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeExtractionAlertProps {
  onRetry: () => Promise<void>;
  onManualEntry: () => void;
  isRetrying?: boolean;
}

export function ResumeExtractionAlert({
  onRetry,
  onManualEntry,
  isRetrying = false,
}: ResumeExtractionAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Automatic plain-text extraction could not be completed.
          </p>
          <p className="text-muted-foreground leading-normal">
            Your original file is preserved safely. If this is a scanned document (image without selectable text), note that OCR is not supported in the MVP. You can retry or enter your résumé text manually below.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-8 gap-1.5 text-xs text-foreground"
        >
          {isRetrying ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-3.5" />
          )}
          Retry Extraction
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onManualEntry}
          className="h-8 gap-1.5 text-xs"
        >
          <FileEditIcon className="size-3.5" />
          Enter Text Manually
        </Button>
      </div>
    </div>
  );
}
