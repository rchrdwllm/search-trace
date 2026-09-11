import { notFound } from "next/navigation";
import { getTRPCCaller } from "@/trpc/server";
import { OpportunityEditClient } from "@/components/opportunities/opportunity-edit-client";

interface PageProps {
  params: Promise<{ opportunityId: string }>;
}

export default async function EditOpportunityPage({ params }: PageProps) {
  const { opportunityId } = await params;
  const trpc = await getTRPCCaller();

  let opportunity;
  try {
    opportunity = await trpc.opportunity.byId({ id: opportunityId });
  } catch {
    notFound();
  }

  return <OpportunityEditClient opportunity={opportunity} />;
}
