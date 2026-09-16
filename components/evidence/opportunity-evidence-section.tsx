"use client";

import { useState } from "react";
import { PlusIcon, LibraryIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EvidenceCard } from "./evidence-card";
import { EvidencePickerDialog } from "./evidence-picker-dialog";
import { EvidenceFormDialog } from "./evidence-form-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { EvidenceItem } from "@/lib/db/schema";

interface OpportunityEvidenceSectionProps {
  opportunityId: string;
}

export function OpportunityEvidenceSection({
  opportunityId,
}: OpportunityEvidenceSectionProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryOptions = trpc.evidence.listByOpportunityId.queryOptions({
    opportunityId,
  });
  const { data, isLoading } = useQuery(queryOptions);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);

  const detachMutation = useMutation(
    trpc.evidence.detach.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      },
    }),
  );

  const handleDetach = (item: EvidenceItem) => {
    detachMutation.mutate({
      opportunityId,
      evidenceItemId: item.id,
    });
  };

  const selectedItems = data?.selected ?? [];
  const availableItems = data?.available ?? [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="grid gap-4 @2xl/card-header:grid-cols-[minmax(0,1fr)_auto] @2xl/card-header:items-start">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
              03 · Source material
            </p>
            <div className="flex items-center gap-2.5">
              <CardTitle className="font-display text-xl font-normal tracking-tight">
                Supporting Evidence
              </CardTitle>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {selectedItems.length} selected
              </span>
            </div>
            <CardDescription>
              Attached from your Evidence Library. Detaching removes an item from this opportunity only; your library copy stays.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 @2xl/card-header:pt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPickerOpen(true)}
              className="gap-1.5"
            >
              <LibraryIcon className="size-4" aria-hidden="true" />
              Attach from Library
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5"
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              New Evidence
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading supporting evidence...
          </div>
        ) : selectedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mx-auto mb-3">
              <LibraryIcon className="size-5" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              No evidence attached to this opportunity
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
              Attach existing projects from your library or create a new accomplishment to back your qualifications.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                className="gap-1.5"
              >
                <LibraryIcon className="size-3.5" aria-hidden="true" />
                Attach from Library
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="gap-1.5"
              >
                <PlusIcon className="size-3.5" aria-hidden="true" />
                New Evidence
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedItems.map((item) => (
              <EvidenceCard
                key={item.id}
                evidence={item}
                isOpportunityView={true}
                onEdit={(ev) => setEditingEvidence(ev)}
                onDetach={handleDetach}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Attach Picker Dialog */}
      <EvidencePickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        opportunityId={opportunityId}
        availableItems={availableItems}
      />

      {/* In-Context Create and Attach Dialog */}
      <EvidenceFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        opportunityId={opportunityId}
      />

      {/* Edit Evidence Dialog */}
      <EvidenceFormDialog
        open={Boolean(editingEvidence)}
        onOpenChange={(open) => {
          if (!open) setEditingEvidence(null);
        }}
        evidence={editingEvidence}
        opportunityId={opportunityId}
      />
    </Card>
  );
}
