"use client";

import { useState, useMemo } from "react";
import { FileTextIcon, PencilIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvidenceCard } from "./evidence-card";
import { EvidenceFormDialog } from "./evidence-form-dialog";
import { EvidenceDeleteDialog } from "./evidence-delete-dialog";
import { EvidenceEmptyState } from "./evidence-empty-state";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { EvidenceItem } from "@/lib/db/schema";
import type { EvidenceType } from "@/lib/validations/evidence";
import { cn } from "@/lib/utils";

type FilterTab = "all" | EvidenceType;

interface EvidenceLibraryClientProps {
  initialEvidence?: EvidenceItem[];
}

export function EvidenceLibraryClient({
  initialEvidence,
}: EvidenceLibraryClientProps) {
  const trpc = useTRPC();
  const queryOptions = trpc.evidence.list.queryOptions(undefined, {
    initialData: initialEvidence,
  });
  const { data: evidenceList = [] } = useQuery(queryOptions);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);
  const [deletingEvidence, setDeletingEvidence] = useState<EvidenceItem | null>(null);

  const counts = useMemo(
    () => ({
      all: evidenceList.length,
      project: evidenceList.filter((e) => e.type === "project").length,
      accomplishment: evidenceList.filter((e) => e.type === "accomplishment").length,
      portfolio_link: evidenceList.filter((e) => e.type === "portfolio_link").length,
    }),
    [evidenceList],
  );

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return evidenceList;
    return evidenceList.filter((e) => e.type === activeTab);
  }, [evidenceList, activeTab]);

  const tabs: Array<{ id: FilterTab; label: string; count: number }> = [
    { id: "all", label: "All Items", count: counts.all },
    { id: "project", label: "Projects", count: counts.project },
    { id: "accomplishment", label: "Accomplishments", count: counts.accomplishment },
    { id: "portfolio_link", label: "Portfolio Links", count: counts.portfolio_link },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-6 border-b pb-8 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Your source material</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><PencilIcon className="size-3.5" aria-hidden="true" /> Added by you</span>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-5xl">Evidence Library</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Keep credible examples of your work in one place, then choose what is relevant for each opportunity. Evidence here is your material—not an AI assessment.
            </p>
          </div>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="h-12 gap-1.5 rounded-md px-4">
          <PlusIcon className="size-4" aria-hidden="true" />
          Add Evidence
        </Button>
      </div>

      {evidenceList.length > 0 && (
        <aside className="grid grid-cols-[auto_1fr] gap-4 rounded-xl bg-muted p-5 text-sm">
          <FileTextIcon className="mt-0.5 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">Reuse the source, tailor the context.</p>
            <p className="mt-1 max-w-3xl text-muted-foreground">One evidence item can support several opportunities. Attaching it does not change the original or imply that it proves every requirement.</p>
          </div>
        </aside>
      )}

      <div className="mb-2 flex gap-6 overflow-x-auto border-b" role="tablist" aria-label="Evidence categories">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-0 pb-3 text-sm font-medium text-muted-foreground transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground font-bold"
                : "hover:text-foreground",
            )}
            aria-pressed={activeTab === tab.id}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "inline-grid min-w-6 place-items-center rounded-full border px-1.5 py-1 text-[10px] font-mono font-normal",
                activeTab === tab.id ? "border-border bg-muted text-foreground" : "border-border bg-muted/50",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {evidenceList.length === 0 ? (
        <EvidenceEmptyState onAddEvidence={() => setIsCreateOpen(true)} />
      ) : filteredItems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No evidence items found for this category.
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground" role="status">Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} in {tabs.find((tab) => tab.id === activeTab)?.label}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              onEdit={(item) => setEditingEvidence(item)}
              onDelete={(item) => setDeletingEvidence(item)}
            />
          ))}
          </div>
        </>
      )}

      {/* Create Dialog */}
      <EvidenceFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Edit Dialog */}
      <EvidenceFormDialog
        open={Boolean(editingEvidence)}
        onOpenChange={(open) => {
          if (!open) setEditingEvidence(null);
        }}
        evidence={editingEvidence}
      />

      {/* Delete Confirmation Dialog */}
      <EvidenceDeleteDialog
        open={Boolean(deletingEvidence)}
        onOpenChange={(open) => {
          if (!open) setDeletingEvidence(null);
        }}
        evidence={deletingEvidence}
      />
    </div>
  );
}
