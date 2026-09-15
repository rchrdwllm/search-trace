"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface OpportunityDeleteDialogProps {
  opportunityId: string;
  opportunityTitle: string;
  trigger?: React.ReactNode;
}

export function OpportunityDeleteDialog({
  opportunityId,
  opportunityTitle,
  trigger,
}: OpportunityDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();

  const deleteMutation = useMutation(
    trpc.opportunity.delete.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        router.push("/dashboard");
        router.refresh();
      },
    }),
  );

  async function handleDelete() {
    await deleteMutation.mutateAsync({ id: opportunityId });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2Icon data-icon="inline-start" aria-hidden="true" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this opportunity?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the opportunity for{" "}
            <strong>{opportunityTitle}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Spinner className="mr-2" />
                Deleting...
              </>
            ) : (
              "Delete permanently"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
