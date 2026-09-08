"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  opportunityStatusEnum,
  type OpportunityStatus,
} from "@/lib/validations/opportunity";

export interface OpportunityFormData {
  company: string;
  role: string;
  jobDescription: string;
  sourceUrl?: string;
  status: OpportunityStatus;
}

interface OpportunityFormProps {
  initialData?: Partial<OpportunityFormData>;
  onSubmit: (data: OpportunityFormData) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function OpportunityForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Opportunity",
}: OpportunityFormProps) {
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [role, setRole] = useState(initialData?.role ?? "");
  const [jobDescription, setJobDescription] = useState(
    initialData?.jobDescription ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [status, setStatus] = useState<OpportunityStatus>(
    initialData?.status ?? "draft",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!company.trim()) {
      newErrors.company = "Company name is required";
    } else if (company.trim().length > 100) {
      newErrors.company = "Company name must be 100 characters or fewer";
    }

    if (!role.trim()) {
      newErrors.role = "Role title is required";
    } else if (role.trim().length > 100) {
      newErrors.role = "Role title must be 100 characters or fewer";
    }

    if (!jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    }

    const trimmedUrl = sourceUrl.trim();
    if (trimmedUrl) {
      try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol !== "https:") {
          newErrors.sourceUrl = "Source URL must use HTTPS (https://...)";
        }
      } catch {
        newErrors.sourceUrl = "Source URL must be a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      company: company.trim(),
      role: role.trim(),
      jobDescription: jobDescription.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Acme Corp"
          required
          maxLength={100}
          aria-invalid={!!errors.company}
          aria-describedby={errors.company ? "company-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.company && (
          <p
            id="company-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.company}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role Title</Label>
        <Input
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          required
          maxLength={100}
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "role-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.role && (
          <p
            id="role-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.role}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as OpportunityStatus)
            }
            disabled={isSubmitting}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30"
          >
            {opportunityStatusEnum.options.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-background text-foreground"
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceUrl">Source URL (optional)</Label>
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://jobs.example.com/posting"
            aria-invalid={!!errors.sourceUrl}
            aria-describedby={errors.sourceUrl ? "sourceUrl-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.sourceUrl && (
            <p
              id="sourceUrl-error"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {errors.sourceUrl}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job Description</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description text here..."
          required
          aria-invalid={!!errors.jobDescription}
          aria-describedby={
            errors.jobDescription ? "jobDescription-error" : undefined
          }
          disabled={isSubmitting}
        />
        {errors.jobDescription && (
          <p
            id="jobDescription-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.jobDescription}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
