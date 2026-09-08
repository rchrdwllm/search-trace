import Link from "next/link";
import { OpportunityStatusBadge } from "./opportunity-status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
    <Card className="transition-colors hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <CardTitle className="truncate text-lg font-semibold">
              <h3 className="inline">
                <Link
                  href={`/dashboard/opportunities/${opportunity.id}`}
                  className="outline-none hover:underline focus:underline"
                >
                  {opportunity.role}
                </Link>
              </h3>
            </CardTitle>
            <CardDescription className="truncate font-medium text-foreground/80">
              {opportunity.company}
            </CardDescription>
          </div>
          <OpportunityStatusBadge status={opportunity.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground flex items-center justify-between">
        <span>Updated {formattedDate}</span>
        <span>
          {opportunity.lastAnalysisState === "completed"
            ? "Analysis ready"
            : "No analysis yet"}
        </span>
      </CardContent>
    </Card>
  );
}
