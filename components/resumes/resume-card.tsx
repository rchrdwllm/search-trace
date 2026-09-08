"use client";

import { FileTextIcon, DownloadIcon, RefreshCwIcon, Trash2Icon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ExtractionState } from "@/lib/validations/resume";

interface ResumeCardProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  extractionState: ExtractionState;
  createdAt: Date | string;
  onDownload: () => void;
  onReplace: () => void;
  onDelete: () => void;
  isDownloading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ResumeCard({
  fileName,
  fileSize,
  fileType,
  extractionState,
  createdAt,
  onDownload,
  onReplace,
  onDelete,
  isDownloading = false,
}: ResumeCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const typeLabel = fileType.includes("pdf")
    ? "PDF"
    : fileType.includes("word") || fileType.includes("docx")
      ? "DOCX"
      : "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3 min-w-0">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5 sm:mt-0">
          <FileTextIcon className="size-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground truncate max-w-[280px] sm:max-w-md" title={fileName}>
              {fileName}
            </h3>
            {extractionState === "ready" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2Icon className="size-3" />
                Extraction ready
              </span>
            )}
            {extractionState === "pending" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Loader2Icon className="size-3 animate-spin" />
                Extracting text...
              </span>
            )}
            {extractionState === "failed" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <AlertCircleIcon className="size-3" />
                Extraction failed
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {typeLabel ? `${typeLabel} • ` : ""}{formatBytes(fileSize)} • Uploaded {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isDownloading}
          aria-label={`Download ${fileName}`}
          className="h-8 gap-1.5 text-xs"
        >
          {isDownloading ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <DownloadIcon className="size-3.5" />
          )}
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReplace}
          aria-label={`Replace ${fileName}`}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCwIcon className="size-3.5" />
          Replace
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label={`Delete ${fileName}`}
          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2Icon className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
