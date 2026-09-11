"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { OpportunityCard, type OpportunityCardData } from "./opportunity-card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["all", "draft", "applied", "interviewing", "rejected", "closed"] as const;

export function OpportunityList({ opportunities }: { opportunities: OpportunityCardData[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return opportunities.filter((opportunity) => {
      const matchesStatus = status === "all" || opportunity.status === status;
      const matchesQuery = `${opportunity.role} ${opportunity.company}`
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [opportunities, query, status]);

  return (
    <>
      <div className="mb-6 flex flex-col items-end gap-4 sm:flex-row">
        <Field className="w-full sm:max-w-sm">
          <FieldLabel htmlFor="opportunity-search">Find an opportunity</FieldLabel>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="opportunity-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search role or company"
              className="pl-9"
            />
          </div>
        </Field>
        <Field className="w-full sm:w-48">
          <FieldLabel htmlFor="opportunity-status">Application status</FieldLabel>
          <Select value={status} onValueChange={(value) => setStatus(value as (typeof statuses)[number])}>
            <SelectTrigger id="opportunity-status" className="h-12 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {statuses.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all" ? "All statuses" : value[0].toUpperCase() + value.slice(1)}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        {query || status !== "all" ? `${visible.length} of ${opportunities.length} opportunities shown` : ""}
      </p>

      {visible.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" role="list" aria-label="Saved opportunities">
          {visible.map((opportunity) => (
            <div key={opportunity.id} role="listitem">
              <OpportunityCard opportunity={opportunity} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed px-6 py-14 text-center">
          <h3 className="font-display text-2xl">No matching opportunities</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try another role or company, or change the status filter.
          </p>
        </div>
      )}
    </>
  );
}
