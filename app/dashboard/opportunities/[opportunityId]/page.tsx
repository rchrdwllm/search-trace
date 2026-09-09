import Link from "next/link";
import { notFound } from "next/navigation";
import { getTRPCCaller } from "@/trpc/server";
import { OpportunityStatusBadge } from "@/components/opportunities/opportunity-status-badge";
import { OpportunityDeleteDialog } from "@/components/opportunities/opportunity-delete-dialog";
import { ResumeSection } from "@/components/resumes/resume-section";
import { RequirementSection } from "@/components/requirements/requirement-section";
import { OpportunityEvidenceSection } from "@/components/evidence/opportunity-evidence-section";
import { OpportunityFeedbackSection } from "@/components/feedback/opportunity-feedback-section";
import { AnalysisSection } from "@/components/analysis/analysis-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ExternalLinkIcon, PencilIcon } from "lucide-react";

interface OpportunityDetailPageProps {
  params: Promise<{ opportunityId: string }>;
}

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const { opportunityId } = await params;
  const trpc = await getTRPCCaller();

  let opportunity;
  try {
    opportunity = await trpc.opportunity.byId({ id: opportunityId });
  } catch {
    notFound();
  }

  const createdFormatted = new Date(opportunity.createdAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );
  const updatedFormatted = new Date(opportunity.updatedAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Breadcrumb aria-label="Location navigation">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {opportunity.company} - {opportunity.role}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {opportunity.role}
            </h1>
            <OpportunityStatusBadge status={opportunity.status} />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {opportunity.company}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <Link href={`/dashboard/opportunities/${opportunity.id}/edit`}>
              <PencilIcon className="mr-1.5 size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <OpportunityDeleteDialog
            opportunityId={opportunity.id}
            opportunityTitle={`${opportunity.role} at ${opportunity.company}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {opportunity.sourceUrl && (
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Source Posting
                </span>
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-medium break-all"
                >
                  View Original Posting
                  <ExternalLinkIcon
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </div>
            )}

            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Analysis State
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {opportunity.lastAnalysisState === "completed"
                  ? "Analysis ready"
                  : "Analysis not yet run"}
              </span>
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <div>Captured: {createdFormatted}</div>
              <div>Last updated: {updatedFormatted}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Job Description
            </CardTitle>
            <CardDescription>
              Verbatim role requirements pasted for evidence-gap analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/20 p-4 text-sm font-sans whitespace-pre-wrap leading-relaxed text-foreground break-words max-h-[600px] overflow-y-auto">
              {opportunity.jobDescription}
            </div>
          </CardContent>
        </Card>
      </div>

      <ResumeSection opportunityId={opportunity.id} />

      <OpportunityEvidenceSection opportunityId={opportunity.id} />

      <OpportunityFeedbackSection opportunityId={opportunity.id} />

      <AnalysisSection opportunityId={opportunity.id} />

      <RequirementSection
        opportunityId={opportunity.id}
        jobDescription={opportunity.jobDescription}
      />
    </div>
  );
}
