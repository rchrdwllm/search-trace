"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ResumeUploadDropzone } from "@/components/resumes/resume-upload-dropzone";
import { ResumeCard } from "@/components/resumes/resume-card";
import { ResumeReviewEditor } from "@/components/resumes/resume-review-editor";
import { ResumeAiConsentToggle } from "@/components/resumes/resume-ai-consent-toggle";
import { ResumeExtractionAlert } from "@/components/resumes/resume-extraction-alert";
import { ResumeReplaceDialog } from "@/components/resumes/resume-replace-dialog";
import { ResumeDeleteDialog } from "@/components/resumes/resume-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ResumeSectionProps {
  opportunityId: string;
}

export function ResumeSection({ opportunityId }: ResumeSectionProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);

  const queryOptions = trpc.resume.getByOpportunityId.queryOptions({
    opportunityId,
  });

  const { data: resume, isLoading, refetch } = useQuery(queryOptions);

  const updateReviewedTextMutation = useMutation(
    trpc.resume.updateReviewedText.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
        setShowManualEditor(false);
      },
    })
  );

  const setAiOptInMutation = useMutation(
    trpc.resume.setAiOptIn.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      },
    })
  );

  const getDownloadUrlMutation = useMutation(
    trpc.resume.getDownloadUrl.mutationOptions()
  );

  const retryExtractionMutation = useMutation(
    trpc.resume.retryExtraction.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      },
    })
  );

  const deleteResumeMutation = useMutation(
    trpc.resume.delete.mutationOptions({
      onSuccess: () => {
        setIsDeleteOpen(false);
        void queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      },
    })
  );

  const handleDownload = async () => {
    try {
      const { downloadUrl } = await getDownloadUrlMutation.mutateAsync({ opportunityId });
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Handled by UI
    }
  };

  const handleConfirmDelete = async () => {
    await deleteResumeMutation.mutateAsync({ opportunityId });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Résumé evaluation materials">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Submitted Résumé
        </h3>
        <p className="text-xs text-muted-foreground">
          The résumé you submitted for this role. One current document is analyzed at a time.
        </p>
      </div>

      {!resume ? (
        <ResumeUploadDropzone
          opportunityId={opportunityId}
          onUploadSuccess={() => void refetch()}
        />
      ) : (
        <div className="space-y-4">
          <ResumeCard
            fileName={resume.fileName}
            fileSize={resume.fileSize}
            fileType={resume.fileType}
            extractionState={resume.extractionState}
            createdAt={resume.createdAt}
            onDownload={handleDownload}
            onReplace={() => setIsReplaceOpen(true)}
            onDelete={() => setIsDeleteOpen(true)}
            isDownloading={getDownloadUrlMutation.isPending}
          />

          {resume.extractionState === "failed" && (
            <ResumeExtractionAlert
              onRetry={async () => {
                await retryExtractionMutation.mutateAsync({ opportunityId });
              }}
              onManualEntry={() => setShowManualEditor(true)}
              isRetrying={retryExtractionMutation.isPending}
            />
          )}

          {(resume.extractionState === "ready" || showManualEditor) && (
            <>
              <ResumeReviewEditor
                reviewedText={resume.reviewedText}
                onSaveText={async (text) => {
                  await updateReviewedTextMutation.mutateAsync({
                    opportunityId,
                    reviewedText: text,
                  });
                }}
                isSaving={updateReviewedTextMutation.isPending}
              />

              <ResumeAiConsentToggle
                enabled={resume.aiOptIn}
                onToggle={async (enabled) => {
                  await setAiOptInMutation.mutateAsync({
                    opportunityId,
                    enabled,
                  });
                }}
                isUpdating={setAiOptInMutation.isPending}
              />
            </>
          )}

          <ResumeReplaceDialog
            opportunityId={opportunityId}
            open={isReplaceOpen}
            onOpenChange={setIsReplaceOpen}
            onReplaced={() => void refetch()}
          />

          <ResumeDeleteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirmDelete={handleConfirmDelete}
            fileName={resume.fileName}
            isDeleting={deleteResumeMutation.isPending}
          />
        </div>
      )}
    </section>
  );
}
