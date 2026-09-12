import Link from "next/link";
import { notFound } from "next/navigation";
import { getTRPCCaller } from "@/trpc/server";
import { OpportunityStatusControl } from "@/components/opportunities/opportunity-status-control";
import { OpportunityDeleteDialog } from "@/components/opportunities/opportunity-delete-dialog";
import { OpportunityPageNavigation } from "@/components/opportunities/opportunity-page-navigation";
import { OpportunityNextStep } from "@/components/opportunities/opportunity-next-step";
import { ResumeSection } from "@/components/resumes/resume-section";
import { RequirementSection } from "@/components/requirements/requirement-section";
import { OpportunityEvidenceSection } from "@/components/evidence/opportunity-evidence-section";
import { OpportunityFeedbackSection } from "@/components/feedback/opportunity-feedback-section";
import { AnalysisSection } from "@/components/analysis/analysis-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ExternalLinkIcon, PencilIcon, LockKeyholeIcon } from "lucide-react";

interface OpportunityDetailPageProps {
  params: Promise<{ opportunityId: string }>;
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { opportunityId } = await params;
  const trpc = await getTRPCCaller();
  let opportunity;
  try {
    opportunity = await trpc.opportunity.byId({ id: opportunityId });
  } catch {
    notFound();
  }
  const formatDate = (value: Date | string) => new Date(value).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb aria-label="Location navigation">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{opportunity.company} - {opportunity.role}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyholeIcon className="size-3.5" aria-hidden="true" />Private workspace</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3">
              <CardDescription className="font-mono text-xs uppercase tracking-wide">{formatDate(opportunity.createdAt)}</CardDescription>
              <h1 className="break-words font-serif text-2xl font-normal tracking-tight sm:text-3xl">{opportunity.role}</h1>
              <p className="text-lg text-muted-foreground">{opportunity.company}</p>
              <OpportunityStatusControl opportunity={{ id: opportunity.id, company: opportunity.company, role: opportunity.role, jobDescription: opportunity.jobDescription, sourceUrl: opportunity.sourceUrl ?? undefined, status: opportunity.status }} />
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Opportunity actions">
              <Button variant="outline" asChild size="sm"><Link href={`/dashboard/opportunities/${opportunity.id}/edit`}><PencilIcon data-icon="inline-start" aria-hidden="true" />Edit</Link></Button>
              <OpportunityDeleteDialog opportunityId={opportunity.id} opportunityTitle={`${opportunity.role} at ${opportunity.company}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4"><OpportunityNextStep opportunityId={opportunity.id} /></CardContent>
      </Card>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <OpportunityPageNavigation />
        <div className="flex min-w-0 flex-col gap-6">
          <section id="overview" aria-labelledby="overview-heading" tabIndex={-1} className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardDescription>01 · Context · Added by you</CardDescription>
                <CardTitle><h2 id="overview-heading">Application details</h2></CardTitle>
              </CardHeader>
              <CardContent className="flex min-w-0 flex-col gap-6">
                <div className="flex min-w-0 flex-col gap-4">
                  <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <div className="flex min-w-0 flex-col gap-1">
                    <dt className="text-muted-foreground">Original posting</dt>
                    <dd>{opportunity.sourceUrl ? <a href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">View posting<ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" /><span className="sr-only">(opens in new tab)</span></a> : "No link added"}</dd>
                    </div>
                    <div className="flex min-w-0 flex-col gap-1"><dt className="text-muted-foreground">Gap review</dt><dd>{opportunity.lastAnalysisState === "completed" ? "Saved review available" : "Not yet reviewed"}</dd></div>
                    <div className="flex min-w-0 flex-col gap-1"><dt className="text-muted-foreground">Captured</dt><dd>{formatDate(opportunity.createdAt)}</dd></div>
                    <div className="flex min-w-0 flex-col gap-1"><dt className="text-muted-foreground">Last updated</dt><dd>{formatDate(opportunity.updatedAt)}</dd></div>
                  </dl>
                  <p className="text-xs leading-relaxed text-muted-foreground">Your application context, recorded here. SearchTrace never contacts the employer.</p>
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <h3 className="text-sm font-medium">Job description <span className="font-normal text-muted-foreground">· pasted by you, unchanged</span></h3>
                  <div tabIndex={0} role="region" aria-label="Pasted job description, scrollable" className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">{opportunity.jobDescription}</div>
                </div>
              </CardContent>
            </Card>
          </section>
          <section id="resume" aria-label="Résumé" tabIndex={-1} className="scroll-mt-24">
            <Card><CardHeader><CardDescription>02 · Source material · Your review controls what is cited</CardDescription></CardHeader><CardContent><ResumeSection opportunityId={opportunity.id} /></CardContent></Card>
          </section>
          <section id="evidence" aria-label="Supporting evidence" tabIndex={-1} className="flex scroll-mt-24 flex-col gap-2">
            <p className="text-xs text-muted-foreground">03 · Source material · Added by you</p>
            <OpportunityEvidenceSection opportunityId={opportunity.id} />
          </section>
          <section id="feedback" aria-label="Employer feedback" tabIndex={-1} className="scroll-mt-24">
            <OpportunityFeedbackSection opportunityId={opportunity.id} sectionLabel="04 · Separate perspective · Employer-reported" />
          </section>
          <section id="gap" aria-label="Gap review" tabIndex={-1} className="scroll-mt-24">
            <Card><CardHeader><CardDescription>05 · Reviewable assessment · AI suggestion</CardDescription></CardHeader><CardContent><AnalysisSection opportunityId={opportunity.id} showNextAction={false} /></CardContent></Card>
          </section>
          <section id="requirements" aria-label="Requirements" tabIndex={-1} className="scroll-mt-24">
            <Card><CardHeader><CardDescription>06 · Requirements · Confirm drafts before review</CardDescription></CardHeader><CardContent><RequirementSection opportunityId={opportunity.id} jobDescription={opportunity.jobDescription} /></CardContent></Card>
          </section>
          <footer className="flex flex-wrap justify-between gap-3 pb-6 text-xs text-muted-foreground"><p>Evidence informs your application. It does not predict an outcome.</p><p>SearchTrace / private to you</p></footer>
        </div>
      </div>
    </div>
  );
}
