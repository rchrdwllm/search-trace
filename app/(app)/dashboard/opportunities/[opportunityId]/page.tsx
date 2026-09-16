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
import { OpportunitySectionNav } from "@/components/opportunities/opportunity-section-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  PencilIcon,
} from "lucide-react";

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

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const createdFormatted = dateFormatter.format(new Date(opportunity.createdAt));
  const updatedFormatted = dateFormatter.format(new Date(opportunity.updatedAt));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
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

      <Card>
        <CardHeader className="gap-5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Captured {createdFormatted}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
                  {opportunity.role}
                </h1>
                <OpportunityStatusBadge status={opportunity.status} />
              </div>
              <p className="text-lg text-muted-foreground">{opportunity.company}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/opportunities/${opportunity.id}/edit`}>
                  <PencilIcon data-icon="inline-start" aria-hidden="true" />
                  Edit
                </Link>
              </Button>
              <OpportunityDeleteDialog
                opportunityId={opportunity.id}
                opportunityTitle={`${opportunity.role} at ${opportunity.company}`}
              />
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Keep every source and assessment for this application together. SearchTrace uses only the evidence you review and explicitly allow.
          </p>
        </CardHeader>
      </Card>

      {opportunity.nextActionText && (
        <Card>
          <CardHeader className="md:px-6">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your one next action
            </p>
            <CardTitle className="flex items-start gap-2 font-display text-base font-normal">
              <ArrowRightIcon className="mt-0.5 shrink-0" aria-hidden="true" />
              {opportunity.nextActionText}
            </CardTitle>
            <CardDescription>
              Bounded from your latest saved evidence-gap review.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <OpportunitySectionNav />

        <div className="flex min-w-0 flex-col gap-6">
          <Card id="overview" className="scroll-mt-24">
            <CardHeader>
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">01 · Opportunity record</p>
              <CardTitle className="font-display text-xl font-normal">Overview</CardTitle>
              <CardDescription>What you captured for this role. SearchTrace never contacts the employer.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-[9rem_1fr]">
                <dt className="text-muted-foreground">Status</dt>
                <dd><OpportunityStatusBadge status={opportunity.status} /></dd>
                <dt className="text-muted-foreground">Source posting</dt>
                <dd>
                  {opportunity.sourceUrl ? (
                    <a href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                      View original posting
                      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  ) : <span className="text-muted-foreground">Not provided</span>}
                </dd>
                <dt className="text-muted-foreground">Gap review</dt>
                <dd>{opportunity.lastAnalysisState === "completed" ? "Review saved" : "Not yet run"}</dd>
                <dt className="text-muted-foreground">Captured</dt>
                <dd>{createdFormatted}</dd>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd>{updatedFormatted}</dd>
              </dl>

              <div className="flex flex-col gap-2">
                <p className="font-sans text-base font-normal">Job description <span className="font-sans text-sm font-normal text-muted-foreground">· pasted by you</span></p>
                <ScrollArea tabIndex={0} aria-label="Pasted job description, scrollable" className="h-80 whitespace-pre-wrap break-words rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                  {opportunity.jobDescription}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          <Card id="resume" className="scroll-mt-24">
            <CardHeader>
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">02 · Source material</p>
              <CardTitle className="font-display text-xl font-normal">Résumé</CardTitle>
              <CardDescription>Review the extracted text that evidence-gap reviews are allowed to cite.</CardDescription>
            </CardHeader>
            <CardContent><ResumeSection opportunityId={opportunity.id} /></CardContent>
          </Card>

          <section id="evidence" className="scroll-mt-24" aria-label="Supporting evidence">
            <OpportunityEvidenceSection opportunityId={opportunity.id} />
          </section>

          <section id="feedback" className="scroll-mt-24" aria-label="Employer feedback">
            <OpportunityFeedbackSection opportunityId={opportunity.id} />
          </section>

          <Card id="gap-review" className="scroll-mt-24">
            <CardHeader>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">05 · Reviewable assessment</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="font-display text-xl font-normal">Evidence-gap review</CardTitle>
                    {opportunity.lastAnalysisState === "completed" && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2Icon className="size-3" aria-hidden="true" />
                        Assessed
                      </span>
                    )}
                  </div>
                  <CardDescription>Compare confirmed requirements with the sources you reviewed and opted in.</CardDescription>
                  <div id={`analysis-metadata-${opportunity.id}`} />
                </div>
                <div id={`analysis-actions-${opportunity.id}`} className="flex items-center gap-2" />
              </div>
            </CardHeader>
            <CardContent><AnalysisSection opportunityId={opportunity.id} actionsTargetId={`analysis-actions-${opportunity.id}`} metadataTargetId={`analysis-metadata-${opportunity.id}`} /></CardContent>
          </Card>

          <Card id="requirements" className="scroll-mt-24">
            <CardHeader>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">06 · Confirmed by you</p>
                  <CardTitle className="font-display text-xl font-normal">Requirements</CardTitle>
                  <CardDescription>Only confirmed items are used in evidence-gap reviews.</CardDescription>
                </div>
                <div id={`requirements-actions-${opportunity.id}`} className="flex items-center gap-2 sm:pt-5" />
              </div>
            </CardHeader>
            <CardContent>
              <RequirementSection
                opportunityId={opportunity.id}
                jobDescription={opportunity.jobDescription}
                actionsTargetId={`requirements-actions-${opportunity.id}`}
              />
            </CardContent>
          </Card>

          <footer className="flex flex-wrap justify-between gap-3 pt-4 text-xs text-muted-foreground">
            <span>Evidence informs your application. It does not predict an outcome.</span>
            <span className="font-mono uppercase tracking-wider">SearchTrace</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
