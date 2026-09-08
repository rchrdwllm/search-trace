"use client";

import { useState, useMemo } from "react";
import { PlusIcon, SearchIcon, CheckIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EvidenceTypeBadge } from "./evidence-type-badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { EvidenceItem } from "@/lib/db/schema";

interface EvidencePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  availableItems: EvidenceItem[];
  onAttached?: () => void;
}

export function EvidencePickerDialog({
  open,
  onOpenChange,
  opportunityId,
  availableItems,
  onAttached,
}: EvidencePickerDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [attachingId, setAttachingId] = useState<string | null>(null);

  const attachMutation = useMutation(
    trpc.evidence.attach.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.evidence.listByOpportunityId.queryKey({ opportunityId }),
        });
        setAttachingId(null);
        onAttached?.();
      },
      onError: () => {
        setAttachingId(null);
      },
    }),
  );

  const handleAttach = (itemId: string) => {
    setAttachingId(itemId);
    attachMutation.mutate({
      opportunityId,
      evidenceItemId: itemId,
    });
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return availableItems;
    return availableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [availableItems, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Attach Evidence from Library</DialogTitle>
          <DialogDescription>
            Select reusable proof items from your personal library to evaluate for this opportunity.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or description..."
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[200px]">
          {availableItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No unattached evidence items available in your library.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No evidence items matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isAttaching = attachingId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <EvidenceTypeBadge type={item.type} />
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1"
                    disabled={isAttaching}
                    onClick={() => handleAttach(item.id)}
                    aria-label={`Attach ${item.title}`}
                  >
                    {isAttaching ? (
                      <CheckIcon className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <PlusIcon className="size-3.5" aria-hidden="true" />
                    )}
                    Attach
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
