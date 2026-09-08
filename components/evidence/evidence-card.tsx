"use client";

import { ExternalLinkIcon, PencilIcon, Trash2Icon, UnlinkIcon } from "lucide-react";
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
        "group flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 shadow-2xs transition-colors hover:border-border/80",
        className,
      )}
      data-testid={`evidence-card-${evidence.id}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <EvidenceTypeBadge type={evidence.type} />
            <h3 className="font-semibold tracking-tight text-foreground text-base leading-snug">
              {evidence.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(evidence)}
                aria-label={`Edit evidence: ${evidence.title}`}
              >
                <PencilIcon className="size-4" aria-hidden="true" />
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
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(evidence)}
                aria-label={`Delete evidence: ${evidence.title}`}
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
          {evidence.description}
        </p>
      </div>

      {evidence.sourceUrl && (
        <div className="pt-2 border-t text-xs">
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium break-all"
            aria-label={`View link for ${evidence.title} (opens in new tab)`}
          >
            <span>{evidence.sourceUrl}</span>
            <ExternalLinkIcon className="size-3 shrink-0" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
