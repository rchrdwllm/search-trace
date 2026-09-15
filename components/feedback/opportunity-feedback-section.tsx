"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackCard } from "./feedback-card";
import { FeedbackFormDialog } from "./feedback-form-dialog";
import { FeedbackDeleteDialog } from "./feedback-delete-dialog";
import { FeedbackEmptyState } from "./feedback-empty-state";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { FeedbackItem } from "@/lib/db/schema";

interface OpportunityFeedbackSectionProps {
  opportunityId: string;
}

export function OpportunityFeedbackSection({
  opportunityId,
}: OpportunityFeedbackSectionProps) {
  const trpc = useTRPC();

  const queryOptions = trpc.feedback.listByOpportunityId.queryOptions({
    opportunityId,
  });
  const { data: feedbackItems, isLoading, isError, refetch } = useQuery(queryOptions);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<FeedbackItem | null>(null);

  const items = feedbackItems ?? [];

  const handleOpenCreate = () => {
    setEditingFeedback(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: FeedbackItem) => {
    setEditingFeedback(item);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: FeedbackItem) => {
    setDeletingFeedback(item);
  };

  return (
    <Card className="w-full" aria-labelledby="employer-feedback-heading">
      <CardHeader>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
              04 · Separate perspective
            </p>
            <div className="flex items-center gap-2.5">
              <CardTitle id="employer-feedback-heading" className="font-display text-xl font-normal tracking-tight">
                Employer Feedback
              </CardTitle>
              <span className="sr-only">
                Reported Signal
              </span>
              {items.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {items.length} {items.length === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>
            <CardDescription>
              What you heard, in your words. Treated as a reported observation, not verified proof of a hiring decision or cause.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 sm:pt-5">
            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <PlusIcon className="size-4" aria-hidden="true" />
              Add Feedback
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="sr-only">
          <strong>Reported Signal Notice:</strong> Employer feedback is preserved strictly as
          reported observations. SearchTrace never presents feedback as verified proof of a
          rejection cause or hiring probability.
        </p>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading employer feedback...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive mb-3">
              Unable to load employer feedback for this opportunity.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <FeedbackEmptyState onAddFeedback={handleOpenCreate} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <FeedbackCard
                key={item.id}
                item={item}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Create / Edit Form Dialog */}
      <FeedbackFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        opportunityId={opportunityId}
        feedback={editingFeedback}
      />

      {/* Delete Confirmation Alert Dialog */}
      <FeedbackDeleteDialog
        open={Boolean(deletingFeedback)}
        onOpenChange={(open) => {
          if (!open) setDeletingFeedback(null);
        }}
        feedback={deletingFeedback}
      />
    </Card>
  );
}
