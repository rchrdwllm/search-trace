"use client";

import { ExternalLinkIcon, PencilIcon, Trash2Icon, UnlinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
        "group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-muted-foreground/60",
        className,
      )}
      data-testid={`evidence-card-${evidence.id}`}
    >
      <div className="flex flex-col gap-3">
        <EvidenceTypeBadge type={evidence.type} />
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-foreground">
            {evidence.title}
          </h3>

          {(onEdit || onDelete || (isOpportunityView && onDetach)) && (
            <div className="flex shrink-0 items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(evidence)}
                  aria-label={`Edit evidence: ${evidence.title}`}
                  title="Edit evidence"
                >
                  <PencilIcon data-icon="inline-start" aria-hidden="true" />
                </Button>
              )}

              {isOpportunityView && onDetach && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDetach(evidence)}
                  aria-label={`Detach evidence: ${evidence.title}`}
                  title="Detach evidence"
                >
                  <UnlinkIcon data-icon="inline-start" aria-hidden="true" />
                </Button>
              )}

              {!isOpportunityView && onDelete && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(evidence)}
                  aria-label={`Delete evidence: ${evidence.title}`}
                  title="Delete evidence"
                >
                  <Trash2Icon data-icon="inline-start" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
          {evidence.description}
        </p>
      </div>

      {evidence.sourceUrl && (
        <div className="pt-1 text-xs">
          <Separator className="mb-2" />
          <a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline break-all" aria-label={`View link for ${evidence.title} (opens in new tab)`}>
            <ExternalLinkIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>{evidence.sourceUrl}</span>
          </a>
        </div>
      )}

    </div>
  );
}
