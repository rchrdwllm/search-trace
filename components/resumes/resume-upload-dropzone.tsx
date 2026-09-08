"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { UploadCloudIcon, Loader2Icon, AlertCircleIcon } from "lucide-react";
import { MAX_RESUME_FILE_SIZE } from "@/lib/validations/resume";
import { cn } from "@/lib/utils";

interface ResumeUploadDropzoneProps {
  opportunityId: string;
  onUploadSuccess?: () => void;
  isReplacing?: boolean;
  disabled?: boolean;
}

export function ResumeUploadDropzone({
  opportunityId,
  onUploadSuccess,
  isReplacing = false,
  disabled = false,
}: ResumeUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setErrorMessage("Only PDF and DOCX documents are accepted.");
      return;
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      setErrorMessage("File size exceeds the 10 MB limit.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/opportunities/${opportunityId}/resume`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to upload résumé. Please try again.");
      }

      onUploadSuccess?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to upload résumé.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 bg-background",
          (disabled || isUploading) && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          id={`resume-upload-${opportunityId}`}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Uploading résumé and extracting text...
            </p>
          </div>
        ) : (
          <label
            htmlFor={`resume-upload-${opportunityId}`}
            className="flex flex-col items-center gap-2 cursor-pointer w-full"
          >
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <UploadCloudIcon className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isReplacing ? "Select a new résumé to replace current file" : "Upload your résumé used for this application"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF or DOCX format, up to 10 MB.
              </p>
            </div>
          </label>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
