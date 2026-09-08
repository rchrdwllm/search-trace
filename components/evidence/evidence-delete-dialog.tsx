"use client";

import { AlertTriangleIcon } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { EvidenceItem } from "@/lib/db/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface EvidenceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: EvidenceItem | null;
  onSuccess?: () => void;
}

export function EvidenceDeleteDialog({
  open,
  onOpenChange,
  evidence,
  onSuccess,
}: EvidenceDeleteDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const attachedQueryOptions = trpc.evidence.getAttachedOpportunities.queryOptions(
    { id: evidence?.id ?? "" },
    {
      enabled: Boolean(open && evidence?.id),
    },
  );

  const { data: attachedOpportunities, isLoading } = useQuery(attachedQueryOptions);

  const deleteMutation = useMutation(
    trpc.evidence.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.evidence.list.queryKey() });
        void queryClient.invalidateQueries(trpc.evidence.listByOpportunityId.queryFilter());
        onSuccess?.();
        onOpenChange(false);
      },
    }),
  );

  const handleDelete = () => {
    if (!evidence) return;
    deleteMutation.mutate({ id: evidence.id });
  };

  const attachedCount = attachedOpportunities?.length ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Evidence Item</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{evidence?.title}&rdquo;
                </span>{" "}
                from your personal library?
              </p>

              {isLoading && (
                <div className="space-y-1 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}

              {!isLoading && attachedCount > 0 && (
                <div
                  role="alert"
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200 text-xs space-y-2"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-100">
                    <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Attached to {attachedCount} {attachedCount === 1 ? "Opportunity" : "Opportunities"}</span>
                  </div>
                  <p className="leading-relaxed">
                    Deleting this evidence item will remove it from your library and detach it from the following {attachedCount === 1 ? "application" : "applications"}:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                    {attachedOpportunities?.map((opp) => (
                      <li key={opp.opportunityId}>
                        <span className="font-medium">{opp.company}</span> — {opp.role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!isLoading && attachedCount === 0 && (
                <p className="text-xs text-muted-foreground">
                  This item is not currently attached to any opportunities.
                </p>
              )}
            </div>
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Evidence"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
