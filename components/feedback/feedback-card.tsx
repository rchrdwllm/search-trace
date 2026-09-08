"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FeedbackSourceBadge } from "./feedback-source-badge";
import { FeedbackProvenanceBadge } from "./feedback-provenance-badge";
import type { FeedbackItem } from "@/lib/db/schema";
import { CalendarIcon, Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface FeedbackCardProps {
  item: FeedbackItem;
  onEdit: (item: FeedbackItem) => void;
  onDelete: (item: FeedbackItem) => void;
}

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function FeedbackCard({ item, onEdit, onDelete }: FeedbackCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isUpdatingOptIn, setIsUpdatingOptIn] = useState(false);

  const optInMutation = useMutation(
    trpc.feedback.setAiOptIn.mutationOptions({
      onMutate: () => {
        setIsUpdatingOptIn(true);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.feedback.listByOpportunityId.queryKey({
            opportunityId: item.opportunityId,
          }),
        });
      },
      onSettled: () => {
        setIsUpdatingOptIn(false);
      },
    }),
  );

  const handleToggleOptIn = (checked: boolean) => {
    optInMutation.mutate({
      id: item.id,
      aiOptIn: checked,
    });
  };

  return (
    <Card className="flex flex-col justify-between transition-all hover:border-foreground/20 hover:shadow-sm">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Metadata Badges & Date */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <CalendarIcon className="size-3.5" aria-hidden="true" />
              {formatDate(item.feedbackDate)}
            </span>
            <FeedbackSourceBadge sourceType={item.sourceType} />
            <FeedbackProvenanceBadge provenance={item.provenance} />
          </div>

          {/* Edit / Delete Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(item)}
              aria-label={`Edit feedback from ${item.feedbackDate}`}
              title="Edit feedback"
            >
              <PencilIcon className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(item)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Delete feedback from ${item.feedbackDate}`}
              title="Delete feedback"
            >
              <Trash2Icon className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Verbatim Plain-Text Content */}
        <p className="whitespace-pre-wrap break-words font-sans text-foreground leading-relaxed">
          {item.text}
        </p>

        {/* AI Opt-In Toggle Control */}
        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/20 p-2.5">
          <div className="flex h-5 items-center pt-0.5">
            <input
              type="checkbox"
              id={`ai-opt-in-${item.id}`}
              checked={item.aiOptIn}
              disabled={isUpdatingOptIn}
              onChange={(e) => handleToggleOptIn(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`ai-opt-in-${item.id}`}
                className="text-xs font-semibold text-foreground cursor-pointer"
              >
                Include in AI analysis
              </Label>
              {isUpdatingOptIn && (
                <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Allow this feedback to be included in gap analysis requests. (Default: <strong>OFF</strong>)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
