"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon } from "lucide-react";

export function OpportunityNextStep({ opportunityId }: { opportunityId: string }) {
  const trpc = useTRPC();
  const summary = useQuery(trpc.analysis.getSummary.queryOptions({ opportunityId }));
  const nextAction = summary.data?.nextAction;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Your one next step</CardDescription>
        {summary.isLoading ? <Skeleton className="h-6 w-full" /> : (
          <CardTitle><h2>{summary.isError ? "Your next step is unavailable" : nextAction?.text ?? "Review your evidence for this opportunity"}</h2></CardTitle>
        )}
        <CardDescription>
          {summary.isError ? "Try loading your saved review again." : nextAction
            ? "Based on your saved gap review. This is an evidence-strengthening suggestion, not a prediction of a hiring outcome."
            : "Confirm the role requirements and review your source material, then run a gap review for one concrete improvement."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-wrap gap-2">
        {summary.isError ? <Button variant="outline" onClick={() => void summary.refetch()}>Try again</Button> : <>
          <Button asChild className="h-auto min-h-8 max-w-full whitespace-normal"><a href={nextAction ? "#evidence" : "#requirements"}>{nextAction ? "Open supporting evidence" : "Review requirements"}<ArrowRightIcon data-icon="inline-end" /></a></Button>
          <Button variant="outline" asChild className="h-auto min-h-8 max-w-full whitespace-normal"><a href="#gap">{nextAction ? "See why this matters" : "Open gap review"}</a></Button>
        </>}
      </CardFooter>
    </Card>
  );
}
