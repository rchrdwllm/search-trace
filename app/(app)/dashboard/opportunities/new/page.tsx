"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  OpportunityForm,
  type OpportunityFormData,
} from "@/components/opportunities/opportunity-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewOpportunityPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useMutation(
    trpc.opportunity.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/dashboard/opportunities/${data.id}`);
      },
      onError: (error) => {
        setServerError(
          error.message || "Failed to create opportunity. Please try again.",
        );
      },
    }),
  );

  async function handleSubmit(data: OpportunityFormData) {
    setServerError(null);
    await createMutation.mutateAsync(data);
  }

  function handleCancel() {
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Breadcrumb aria-label="Location navigation">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Opportunity</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Capture Opportunity</CardTitle>
          <CardDescription>
            Save a target job role and its pasted description to analyze your
            evidence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-6" role="alert">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <OpportunityForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
            submitLabel="Create Opportunity"
          />
        </CardContent>
      </Card>
    </div>
  );
}
