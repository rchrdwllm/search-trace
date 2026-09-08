"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  evidenceTypeEnum,
  type EvidenceType,
} from "@/lib/validations/evidence";
import { evidenceTypeLabels } from "./evidence-type-badge";
import type { EvidenceItem } from "@/lib/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface EvidenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence?: EvidenceItem | null;
  opportunityId?: string;
  onSuccess?: () => void;
}

interface EvidenceFormProps {
  evidence?: EvidenceItem | null;
  opportunityId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function EvidenceForm({
  evidence,
  opportunityId,
  onClose,
  onSuccess,
}: EvidenceFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEditing = Boolean(evidence);
  const isContextual = Boolean(opportunityId && !evidence);

  const [title, setTitle] = useState(evidence?.title ?? "");
  const [description, setDescription] = useState(evidence?.description ?? "");
  const [type, setType] = useState<EvidenceType>(evidence?.type ?? "project");
  const [sourceUrl, setSourceUrl] = useState(evidence?.sourceUrl ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation(
    trpc.evidence.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.evidence.list.queryKey() });
        onSuccess?.();
        onClose();
      },
      onError: (err: { message?: string }) => {
        setErrorMessage(err.message || "Failed to create evidence item");
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.evidence.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.evidence.list.queryKey() });
        if (evidence) {
          void queryClient.invalidateQueries({ queryKey: trpc.evidence.byId.queryKey({ id: evidence.id }) });
        }
        void queryClient.invalidateQueries(trpc.evidence.listByOpportunityId.queryFilter());
        onSuccess?.();
        onClose();
      },
      onError: (err: { message?: string }) => {
        setErrorMessage(err.message || "Failed to update evidence item");
      },
    }),
  );

  const createAndAttachMutation = useMutation(
    trpc.evidence.createAndAttach.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.evidence.list.queryKey() });
        if (opportunityId) {
          void queryClient.invalidateQueries({ queryKey: trpc.evidence.listByOpportunityId.queryKey({ opportunityId }) });
        }
        onSuccess?.();
        onClose();
      },
      onError: (err: { message?: string }) => {
        setErrorMessage(err.message || "Failed to create and attach evidence item");
      },
    }),
  );

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    createAndAttachMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Title is required");
      return;
    }
    if (trimmedTitle.length > 120) {
      setErrorMessage("Title must be 120 characters or fewer");
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setErrorMessage("Description is required");
      return;
    }
    if (trimmedDescription.length > 2000) {
      setErrorMessage("Description must be 2,000 characters or fewer");
      return;
    }

    const trimmedUrl = sourceUrl.trim();
    if (trimmedUrl) {
      if (!trimmedUrl.startsWith("https://")) {
        setErrorMessage("Source URL must use HTTPS");
        return;
      }
      try {
        new URL(trimmedUrl);
      } catch {
        setErrorMessage("Source URL must be a valid URL");
        return;
      }
    }

    if (isEditing && evidence) {
      updateMutation.mutate({
        id: evidence.id,
        title: trimmedTitle,
        description: trimmedDescription,
        type,
        sourceUrl: trimmedUrl || undefined,
      });
    } else if (isContextual && opportunityId) {
      createAndAttachMutation.mutate({
        opportunityId,
        title: trimmedTitle,
        description: trimmedDescription,
        type,
        sourceUrl: trimmedUrl || undefined,
      });
    } else {
      createMutation.mutate({
        title: trimmedTitle,
        description: trimmedDescription,
        type,
        sourceUrl: trimmedUrl || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="evidence-title">Title</Label>
          <span
            className="text-xs text-muted-foreground"
            aria-live="polite"
          >
            {title.length}/120
          </span>
        </div>
        <Input
          id="evidence-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Distributed Task Queue"
          maxLength={120}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evidence-type">Type</Label>
        <select
          id="evidence-type"
          value={type}
          onChange={(e) => setType(e.target.value as EvidenceType)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        >
          {evidenceTypeEnum.options.map((opt) => (
            <option key={opt} value={opt} className="bg-popover text-popover-foreground">
              {evidenceTypeLabels[opt]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="evidence-description">Description</Label>
          <span
            className="text-xs text-muted-foreground"
            aria-live="polite"
          >
            {description.length}/2000
          </span>
        </div>
        <Textarea
          id="evidence-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your accomplishment, project scope, architecture, or key metrics achieved."
          rows={4}
          maxLength={2000}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evidence-url">Source Link (Optional)</Label>
        <Input
          id="evidence-url"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://github.com/username/project"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Must begin with https://. External links are preserved for your review.
        </p>
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : isContextual
                ? "Creating & Attaching..."
                : "Creating..."
            : isEditing
              ? "Save Changes"
              : isContextual
                ? "Create & Attach"
                : "Create Evidence"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EvidenceFormDialog({
  open,
  onOpenChange,
  evidence,
  opportunityId,
  onSuccess,
}: EvidenceFormDialogProps) {
  const isEditing = Boolean(evidence);
  const isContextual = Boolean(opportunityId && !evidence);

  const title = isEditing
    ? "Edit Evidence Item"
    : isContextual
      ? "Add Evidence to Opportunity"
      : "Add Evidence Item";

  const description = isEditing
    ? "Update this proof item in your personal evidence library."
    : isContextual
      ? "Create a new proof item and automatically select it for this opportunity."
      : "Catalog a project, accomplishment, or portfolio link in your library.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {open && (
          <EvidenceForm
            evidence={evidence}
            opportunityId={opportunityId}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
