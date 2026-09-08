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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { FeedbackItem } from "@/lib/db/schema";

interface FeedbackDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: FeedbackItem | null;
  onSuccess?: () => void;
}

export function FeedbackDeleteDialog({
  open,
  onOpenChange,
  feedback,
  onSuccess,
}: FeedbackDeleteDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    trpc.feedback.delete.mutationOptions({
      onSuccess: () => {
        if (feedback?.opportunityId) {
          void queryClient.invalidateQueries({
            queryKey: trpc.feedback.listByOpportunityId.queryKey({
              opportunityId: feedback.opportunityId,
            }),
          });
        }
        onSuccess?.();
        onOpenChange(false);
      },
    }),
  );

  const handleDelete = () => {
    if (!feedback) return;
    deleteMutation.mutate({ id: feedback.id });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employer Feedback</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete this feedback entry? This
            action cannot be undone and will exclude this feedback from all future
            analyses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Feedback"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
