import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getTRPCCaller } from "@/trpc/server";
import { OpportunityList } from "@/components/opportunities/opportunity-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, BriefcaseIcon, FileTextIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireSession();
  const trpc = await getTRPCCaller();
  const opportunities = await trpc.opportunity.list();

  return (
    <section
      className="mx-auto w-full max-w-6xl"
      aria-labelledby="dashboard-title"
    >
      <div className="flex flex-col items-start justify-between gap-6 border-b pb-8 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Your application workspace
          </p>
          <h1
            id="dashboard-title"
            className="mt-4 font-display text-4xl font-normal tracking-tight sm:text-5xl"
          >
            Welcome, {session.user.name}
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A clearer view of what your experience can support. Pick an
            opportunity to continue with its evidence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-12 rounded-md px-4">
            <Link href="/dashboard/opportunities/new">
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              New Opportunity
            </Link>
          </Button>
        </div>
      </div>
      <aside
        className="my-8 grid grid-cols-[auto_1fr] gap-4 rounded-xl bg-muted p-5"
        aria-label="About your evidence"
      >
        <FileTextIcon className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <p className="font-medium">
            Your evidence is the starting point. AI is a second perspective.
          </p>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Review what you submitted separately from AI interpretation. An
            analysis can suggest gaps to consider; it cannot tell you whether
            you’ll get the job.
          </p>
        </div>
      </aside>

      <div className="mt-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-normal tracking-tight">
            Your Opportunities{" "}
            <span className="ml-2 inline-flex size-7 translate-y-[-1px] items-center justify-center rounded-md border align-middle font-mono text-xs">
              {opportunities.length}
            </span>
          </h2>
          <span className="text-sm text-muted-foreground">
            {opportunities.length}{" "}
            {opportunities.length === 1 ? "role" : "roles"} tracked
          </span>
        </div>

        {opportunities.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <BriefcaseIcon
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-medium">
                No opportunities captured yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                SearchTrace analyzes one job opportunity at a time. Save a job
                posting and its requirements to begin mapping your evidence.
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard/opportunities/new">
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Create Your First Opportunity
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <OpportunityList opportunities={opportunities} />
        )}
      </div>
    </section>
  );
}
