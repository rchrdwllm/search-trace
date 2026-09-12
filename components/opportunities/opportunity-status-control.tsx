"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { opportunityStatusEnum, type UpdateOpportunityInput } from "@/lib/validations/opportunity";
import { OpportunityStatusBadge } from "./opportunity-status-badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OpportunityStatusControl({ opportunity }: { opportunity: UpdateOpportunityInput }) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation(trpc.opportunity.update.mutationOptions({
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.opportunity.list.queryFilter());
      router.refresh();
    },
  }));
  const status = mutation.data?.status ?? opportunity.status;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <OpportunityStatusBadge status={status} />
        <Label htmlFor="opportunity-status">Status</Label>
        <Select value={status} disabled={mutation.isPending} onValueChange={(value) => mutation.mutate({ ...opportunity, status: opportunityStatusEnum.parse(value) })}>
          <SelectTrigger id="opportunity-status" aria-describedby="status-help"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>{opportunityStatusEnum.options.map((value) => <SelectItem key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <span id="status-help" className="text-xs text-muted-foreground">Updates stay in this workspace.</span>
      </div>
      {mutation.isError && <Alert variant="destructive" role="alert"><AlertDescription>{mutation.error.message}</AlertDescription></Alert>}
      <span role="status" className="sr-only">{mutation.isPending ? "Saving status" : mutation.isSuccess ? "Status saved" : ""}</span>
    </div>
  );
}
