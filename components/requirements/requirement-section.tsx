"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PlusIcon, RefreshCwIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequirementCard } from "./requirement-card";
import { RequirementDraftBanner } from "./requirement-draft-banner";
import { RequirementEmptyState } from "./requirement-empty-state";
import { RequirementQuotaAlert } from "./requirement-quota-alert";
import { RequirementEditDialog } from "./requirement-edit-dialog";
import { RequirementAddDialog } from "./requirement-add-dialog";
import { RequirementReextractDialog } from "./requirement-reextract-dialog";
import type { RequirementCategory } from "@/lib/validations/requirement";

interface RequirementSectionProps {
  opportunityId: string;
  jobDescription: string;
}

interface DraftItem {
  tempId?: string;
  id?: string;
  title: string;
  category: RequirementCategory;
  jobDescriptionExcerpt: string;
  orderIndex: number;
}

export function RequirementSection({
  opportunityId,
  jobDescription,
}: RequirementSectionProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const listQueryOptions = trpc.requirement.listByOpportunityId.queryOptions({
    opportunityId,
  });
  const usageQueryOptions = trpc.requirement.getDailyUsage.queryOptions();

  const { data: savedRequirements, isLoading: isListLoading } = useQuery(listQueryOptions);
  const { data: usageData } = useQuery(usageQueryOptions);

  const [draftRequirements, setDraftRequirements] = useState<DraftItem[] | null>(null);
  const [editingItem, setEditingItem] = useState<{ index: number; req: DraftItem } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isReextractOpen, setIsReextractOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const extractMutation = useMutation(
    trpc.requirement.extract.mutationOptions({
      onSuccess: (data) => {
        setDraftRequirements(data.draftRequirements);
        setErrorMessage(null);
        void queryClient.invalidateQueries({ queryKey: usageQueryOptions.queryKey });
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to extract requirements. Please try again.");
      },
    })
  );

  const saveMutation = useMutation(
    trpc.requirement.save.mutationOptions({
      onSuccess: () => {
        setDraftRequirements(null);
        setErrorMessage(null);
        void queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey });
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to save requirements.");
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.requirement.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey });
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to delete requirement.");
      },
    })
  );

  const handleStartExtraction = () => {
    if (savedRequirements && savedRequirements.length > 0 && !draftRequirements) {
      setIsReextractOpen(true);
    } else {
      executeExtraction();
    }
  };

  const executeExtraction = () => {
    setIsReextractOpen(false);
    setErrorMessage(null);
    extractMutation.mutate({ opportunityId });
  };

  const handleSaveDraft = () => {
    if (!draftRequirements || draftRequirements.length === 0) return;
    saveMutation.mutate({
      opportunityId,
      requirements: draftRequirements.map((req, idx) => ({
        id: req.id,
        title: req.title,
        category: req.category,
        jobDescriptionExcerpt: req.jobDescriptionExcerpt,
        orderIndex: idx,
      })),
    });
  };

  const handleDiscardDraft = () => {
    setDraftRequirements(null);
    setErrorMessage(null);
  };

  const handleEditItem = (index: number, req: DraftItem) => {
    setEditingItem({ index, req });
  };

  const handleSaveEditedItem = (updated: {
    title: string;
    category: RequirementCategory;
    jobDescriptionExcerpt: string;
  }) => {
    if (!editingItem) return;

    if (draftRequirements) {
      // In draft mode, update the draft item directly
      const next = [...draftRequirements];
      next[editingItem.index] = {
        ...next[editingItem.index],
        ...updated,
      };
      setDraftRequirements(next);
    } else if (savedRequirements) {
      // In saved mode, convert saved requirements to draft with edit applied
      const next: DraftItem[] = savedRequirements.map((r, i) =>
        i === editingItem.index ? { ...r, ...updated, category: updated.category } : { ...r, category: r.category as RequirementCategory }
      );
      setDraftRequirements(next);
    }

    setEditingItem(null);
  };

  const handleAddItem = (newReq: {
    title: string;
    category: RequirementCategory;
    jobDescriptionExcerpt: string;
  }) => {
    const baseList: DraftItem[] = draftRequirements
      ? [...draftRequirements]
      : savedRequirements
        ? savedRequirements.map((r) => ({ ...r, category: r.category as RequirementCategory }))
        : [];

    baseList.push({
      tempId: crypto.randomUUID(),
      title: newReq.title,
      category: newReq.category,
      jobDescriptionExcerpt: newReq.jobDescriptionExcerpt,
      orderIndex: baseList.length,
    });

    setDraftRequirements(baseList);
  };

  const handleDeleteItem = (index: number, req: DraftItem) => {
    if (draftRequirements) {
      const next = draftRequirements.filter((_, i) => i !== index);
      setDraftRequirements(next);
    } else if (req.id) {
      deleteMutation.mutate({ id: req.id });
    }
  };

  const isExtracting = extractMutation.isPending;
  const isSaving = saveMutation.isPending;
  const isDraftMode = draftRequirements !== null;
  const displayItems: DraftItem[] = isDraftMode
    ? draftRequirements
    : (savedRequirements || []).map((r) => ({ ...r, category: r.category as RequirementCategory }));

  const remainingQuota = usageData?.remaining ?? 5;
  const quotaLimit = usageData?.limit ?? 5;
  const quotaUsed = usageData?.used ?? 0;
  const isQuotaExhausted = remainingQuota <= 0;

  return (
    <section className="space-y-4 pt-4 border-t" aria-labelledby="requirements-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 id="requirements-heading" className="text-base font-semibold text-foreground">
            Role Requirements
          </h3>
          <p className="text-xs text-muted-foreground">
            Target qualifications and responsibilities extracted from the job description with verifiable citations.
          </p>
        </div>

        {displayItems.length > 0 && !isDraftMode && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="text-xs h-8"
            >
              <PlusIcon className="size-3.5 mr-1" />
              Add Requirement
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStartExtraction}
              disabled={isExtracting || isQuotaExhausted}
              className="text-xs h-8"
            >
              {isExtracting ? (
                <>
                  <Loader2Icon className="size-3.5 mr-1 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="size-3.5 mr-1" />
                  Re-extract
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <RequirementQuotaAlert
        used={quotaUsed}
        limit={quotaLimit}
        remaining={remainingQuota}
        resetsAt={usageData?.resetsAt}
      />

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isDraftMode && (
        <RequirementDraftBanner
          count={draftRequirements.length}
          onSave={handleSaveDraft}
          onDiscard={handleDiscardDraft}
          onAdd={() => setIsAddOpen(true)}
          isSaving={isSaving}
        />
      )}

      {isListLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : displayItems.length === 0 ? (
        <RequirementEmptyState
          onExtract={handleStartExtraction}
          onAdd={() => setIsAddOpen(true)}
          isExtracting={isExtracting}
          quotaExhausted={isQuotaExhausted}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {displayItems.map((item, idx) => (
            <RequirementCard
              key={item.id || item.tempId || `req-${idx}`}
              title={item.title}
              category={item.category}
              jobDescriptionExcerpt={item.jobDescriptionExcerpt}
              isDraft={isDraftMode}
              onEdit={() => handleEditItem(idx, item)}
              onDelete={() => handleDeleteItem(idx, item)}
            />
          ))}
        </div>
      )}

      <RequirementEditDialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => !open && setEditingItem(null)}
        requirement={editingItem?.req ?? null}
        jobDescription={jobDescription}
        onSave={handleSaveEditedItem}
      />

      <RequirementAddDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        jobDescription={jobDescription}
        onAdd={handleAddItem}
      />

      <RequirementReextractDialog
        open={isReextractOpen}
        onOpenChange={setIsReextractOpen}
        onConfirm={executeExtraction}
        isExtracting={isExtracting}
      />
    </section>
  );
}
