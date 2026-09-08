"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResumeUploadDropzone } from "@/components/resumes/resume-upload-dropzone";

interface ResumeReplaceDialogProps {
  opportunityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplaced: () => void;
}

export function ResumeReplaceDialog({
  opportunityId,
  open,
  onOpenChange,
  onReplaced,
}: ResumeReplaceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Replace existing résumé?</AlertDialogTitle>
          <AlertDialogDescription>
            Uploading a new résumé will permanently delete the current file from private storage and reset your reviewed plain text and AI consent settings.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <ResumeUploadDropzone
            opportunityId={opportunityId}
            isReplacing={true}
            onUploadSuccess={() => {
              onOpenChange(false);
              onReplaced();
            }}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
