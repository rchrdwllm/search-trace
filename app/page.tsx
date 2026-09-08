import { AppShell } from "@/components/app-shell";
import { FoundationSkeleton } from "@/components/foundation-skeleton";
import { FoundationStatus } from "@/components/foundation-status";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

export default function Home() {
  return (
    <AppShell>
      <section aria-labelledby="page-title" className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Project foundation</p>
          <h1 id="page-title" className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            SearchTrace keeps evidence and interpretation clearly separated.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            This foundation establishes the accessible shell and reusable states for a future
            evidence review workflow. No account, persistence, analysis, or service connection is
            active yet.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <CardTitle>Ready for the next feature</CardTitle>
              <CardDescription>
                The structure is in place without requiring credentials or a live backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FoundationStatus kind="info">
                The SearchTrace shell renders independently of Supabase configuration.
              </FoundationStatus>
              <Alert role="status">
                <Info aria-hidden="true" />
                <AlertTitle>Honest scope</AlertTitle>
                <AlertDescription>
                  Opportunity review, evidence extraction, and saved workspaces are intentionally
                  deferred to later features.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex-wrap gap-3">
              <Button disabled type="button">
                Start an evidence review
              </Button>
              <span className="text-sm text-muted-foreground">
                Unavailable until service integration.
              </span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration preview</CardTitle>
              <CardDescription>
                Public setup values will be requested only by a future integration entry point.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="project-name">Workspace label</FieldLabel>
                  <Input
                    id="project-name"
                    placeholder="Not connected"
                    disabled
                    aria-describedby="project-name-help"
                  />
                  <FieldDescription id="project-name-help">
                    This example field establishes the shared form pattern; it does not save data.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="loading-title" className="mt-4 rounded-xl border bg-card p-4">
          <h2 id="loading-title" className="mb-3 text-sm font-medium">
            Loading pattern
          </h2>
          <FoundationSkeleton />
        </section>
      </section>
    </AppShell>
  );
}
