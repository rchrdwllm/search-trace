import Link from "next/link";
import { OpportunityStatusBadge } from "./opportunity-status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRightIcon, CheckIcon, FileTextIcon } from "lucide-react";
import type { OpportunityStatus } from "@/lib/validations/opportunity";

export interface OpportunityCardData {
  id: string;
  company: string;
  role: string;
  status: OpportunityStatus;
  sourceUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastAnalysisState?: "none" | "pending" | "completed";
}

interface OpportunityCardProps {
  opportunity: OpportunityCardData;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const formattedDate = new Date(opportunity.updatedAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <Card className="h-full transition-colors hover:ring-foreground/25 focus-within:ring-2 focus-within:ring-ring">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="truncate font-medium">
            {opportunity.company}
          </CardDescription>
          <OpportunityStatusBadge status={opportunity.status} />
        </div>
        <div className="mt-4 min-w-0">
            <CardTitle className="truncate text-lg font-semibold tracking-tight">
              <h3 className="inline">
                <Link
                  href={`/dashboard/opportunities/${opportunity.id}`}
                  className="outline-none hover:underline focus:underline"
                >
                  {opportunity.role}
                </Link>
              </h3>
            </CardTitle>
            <p className="mt-2 text-xs text-muted-foreground">Updated {formattedDate}</p>
        </div>
      </CardHeader>
      <CardContent className="mt-auto" />
      <CardFooter className="justify-between gap-3 bg-transparent text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          {opportunity.lastAnalysisState === "completed" ? (
            <CheckIcon aria-hidden="true" />
          ) : (
            <FileTextIcon aria-hidden="true" />
          )}
          {opportunity.lastAnalysisState === "completed"
            ? "Analysis ready"
            : "No analysis yet"}
        </span>
        <Link
          href={`/dashboard/opportunities/${opportunity.id}`}
          aria-label={`Open ${opportunity.role} at ${opportunity.company}`}
          className="inline-flex min-h-8 items-center gap-1 font-semibold text-foreground outline-none hover:text-primary hover:underline focus:text-primary focus:underline"
        >
          Open opportunity
          <ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
