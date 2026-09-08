import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getTRPCCaller } from "@/trpc/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, BriefcaseIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireSession();
  const trpc = await getTRPCCaller();
  const opportunities = await trpc.opportunity.list();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8" aria-labelledby="dashboard-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Private workspace</p>
          <h1 id="dashboard-title" className="text-3xl font-semibold">
            Welcome, {session.user.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard/opportunities/new">
              <PlusIcon className="mr-1.5 size-4" aria-hidden="true" />
              New Opportunity
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight">Your Opportunities</h2>
          <span className="text-sm text-muted-foreground">
            {opportunities.length} {opportunities.length === 1 ? "role" : "roles"} tracked
          </span>
        </div>

        {opportunities.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <BriefcaseIcon className="size-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium">No opportunities captured yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                SearchTrace analyzes one job opportunity at a time. Save a job posting and its requirements to begin mapping your evidence.
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard/opportunities/new">
                  <PlusIcon className="mr-1.5 size-4" aria-hidden="true" />
                  Create Your First Opportunity
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            role="list"
            aria-label="Saved opportunities"
          >
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} role="listitem">
                <OpportunityCard opportunity={opportunity} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
