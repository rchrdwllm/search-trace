"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Opportunity } from "@/lib/db/schema";

interface OpportunityEditClientProps {
  opportunity: Opportunity;
}

export function OpportunityEditClient({
  opportunity,
}: OpportunityEditClientProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [serverError, setServerError] = useState<string | null>(null);

  const updateMutation = useMutation(
    trpc.opportunity.update.mutationOptions({
      onSuccess: () => {
        router.push(`/dashboard/opportunities/${opportunity.id}`);
        router.refresh();
      },
      onError: (error) => {
        setServerError(
          error.message || "Failed to update opportunity. Please try again.",
        );
      },
    }),
  );

  async function handleSubmit(data: OpportunityFormData) {
    setServerError(null);
    await updateMutation.mutateAsync({
      id: opportunity.id,
      ...data,
    });
  }

  function handleCancel() {
    router.push(`/dashboard/opportunities/${opportunity.id}`);
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
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/opportunities/${opportunity.id}`}>
                {opportunity.company} - {opportunity.role}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Opportunity</CardTitle>
          <CardDescription>
            Update company, role, requirements, or application status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-6" role="alert">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <OpportunityForm
            initialData={{
              company: opportunity.company,
              role: opportunity.role,
              jobDescription: opportunity.jobDescription,
              sourceUrl: opportunity.sourceUrl ?? undefined,
              status: opportunity.status,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
