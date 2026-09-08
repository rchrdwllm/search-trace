"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RequirementReextractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isExtracting?: boolean;
}

export function RequirementReextractDialog({
  open,
  onOpenChange,
  onConfirm,
  isExtracting = false,
}: RequirementReextractDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Re-extract Requirements?</AlertDialogTitle>
          <AlertDialogDescription>
            Re-extracting will generate a new draft of requirements directly from the job description using Gemini 3.6 Flash.
            Your currently saved requirements and any manual edits will be replaced once you save the new draft.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExtracting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isExtracting}
          >
            Re-extract Requirements
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
