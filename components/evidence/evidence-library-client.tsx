"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Breadcrumb aria-label="Location navigation">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Evidence Library</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Evidence Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Maintain reusable proof of your work once and attach relevant proof to specific opportunities.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <PlusIcon className="size-4" aria-hidden="true" />
          Add Evidence
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-pressed={activeTab === tab.id}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                activeTab === tab.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
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
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No evidence items found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              onEdit={(item) => setEditingEvidence(item)}
              onDelete={(item) => setDeletingEvidence(item)}
            />
          ))}
        </div>
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
