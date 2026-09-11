"use client";

import { ExternalLinkIcon, FileTextIcon, PencilIcon, Trash2Icon, UnlinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvidenceTypeBadge } from "./evidence-type-badge";
import type { EvidenceItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface EvidenceCardProps {
  evidence: EvidenceItem;
  onEdit?: (evidence: EvidenceItem) => void;
  onDelete?: (evidence: EvidenceItem) => void;
  onDetach?: (evidence: EvidenceItem) => void;
  isOpportunityView?: boolean;
  className?: string;
}

export function EvidenceCard({
  evidence,
  onEdit,
  onDelete,
  onDetach,
  isOpportunityView = false,
  className,
}: EvidenceCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-lg border bg-card p-6 transition-colors hover:border-muted-foreground/60",
        className,
      )}
      data-testid={`evidence-card-${evidence.id}`}
    >
      <div className="space-y-3">
        <EvidenceTypeBadge type={evidence.type} />
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {evidence.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
          {evidence.description}
        </p>
      </div>

      {evidence.sourceUrl && (
        <div className="border-t pt-3 text-xs">
          <a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary hover:underline break-all" aria-label={`View link for ${evidence.title} (opens in new tab)`}>
            <ExternalLinkIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>{evidence.sourceUrl}</span>
          </a>
        </div>
      )}

      <details className="grid gap-1 border-t pt-3">
        <summary className="flex min-h-11 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <FileTextIcon className="size-4" aria-hidden="true" />
          Attach this item to an opportunity
        </summary>
        <p className="pl-5 text-sm text-muted-foreground">Choose relevant opportunities while editing this evidence.</p>
      </details>

      <div className="flex items-center gap-1 pt-1 opacity-80 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-11 gap-1.5 rounded-md border px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(evidence)}
                aria-label={`Edit evidence: ${evidence.title}`}
              >
                <PencilIcon className="size-4" aria-hidden="true" />
                <span>Edit</span>
              </Button>
            )}

            {isOpportunityView && onDetach && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                onClick={() => onDetach(evidence)}
                aria-label={`Detach evidence: ${evidence.title}`}
              >
                <UnlinkIcon className="size-3.5" aria-hidden="true" />
                Detach
              </Button>
            )}

            {!isOpportunityView && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-11 gap-1.5 rounded-md border px-3 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(evidence)}
                aria-label={`Delete evidence: ${evidence.title}`}
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
                <span>Delete</span>
              </Button>
            )}
      </div>
    </div>
  );
}
