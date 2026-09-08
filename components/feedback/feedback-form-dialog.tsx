"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  feedbackSourceTypeEnum,
  feedbackProvenanceEnum,
  type FeedbackProvenance,
  type FeedbackSourceType,
} from "@/lib/validations/feedback";
import { feedbackSourceLabels } from "./feedback-source-badge";
import { feedbackProvenanceLabels } from "./feedback-provenance-badge";
import type { FeedbackItem } from "@/lib/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ShieldAlertIcon } from "lucide-react";

interface FeedbackFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  feedback?: FeedbackItem | null;
  onSuccess?: () => void;
}

interface FeedbackFormProps {
  opportunityId: string;
  feedback?: FeedbackItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function getTodayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function FeedbackForm({
  opportunityId,
  feedback,
  onClose,
  onSuccess,
}: FeedbackFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEditing = Boolean(feedback);

  const [feedbackDate, setFeedbackDate] = useState(
    feedback?.feedbackDate ?? getTodayIsoDate(),
  );
  const [text, setText] = useState(feedback?.text ?? "");
  const [sourceType, setSourceType] = useState<FeedbackSourceType>(
    feedback?.sourceType ?? "interview_feedback",
  );
  const [provenance, setProvenance] = useState<FeedbackProvenance>(
    feedback?.provenance ?? "exact_quote",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation(
    trpc.feedback.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.feedback.listByOpportunityId.queryKey({
            opportunityId,
          }),
        });
        onSuccess?.();
        onClose();
      },
      onError: (err: { message?: string }) => {
        setErrorMessage(err.message || "Failed to save employer feedback");
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.feedback.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.feedback.listByOpportunityId.queryKey({
            opportunityId,
          }),
        });
        if (feedback) {
          void queryClient.invalidateQueries({
            queryKey: trpc.feedback.byId.queryKey({ id: feedback.id }),
          });
        }
        onSuccess?.();
        onClose();
      },
      onError: (err: { message?: string }) => {
        setErrorMessage(err.message || "Failed to update feedback details");
      },
    }),
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedDate = feedbackDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      setErrorMessage("Date must be in YYYY-MM-DD format");
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setErrorMessage("Feedback text is required");
      return;
    }
    if (trimmedText.length > 5000) {
      setErrorMessage("Feedback text must be 5,000 characters or fewer");
      return;
    }

    if (isEditing && feedback) {
      updateMutation.mutate({
        id: feedback.id,
        feedbackDate: trimmedDate,
        text: trimmedText,
        sourceType,
        provenance,
      });
    } else {
      createMutation.mutate({
        opportunityId,
        feedbackDate: trimmedDate,
        text: trimmedText,
        sourceType,
        provenance,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Privacy Notice Banner */}
      <Alert className="border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        <ShieldAlertIcon className="size-4 text-amber-700 dark:text-amber-400" />
        <AlertDescription className="text-xs leading-relaxed">
          <strong>Privacy Notice:</strong> Please do not paste recruiter email
          addresses, phone numbers, signatures, or private email headers. Keep
          feedback focused on role and evaluation content.
        </AlertDescription>
      </Alert>

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {/* Date & Source Type Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="feedback-date" className="text-xs font-semibold">
            Date Received <span className="text-destructive">*</span>
          </Label>
          <Input
            id="feedback-date"
            type="date"
            value={feedbackDate}
            onChange={(e) => setFeedbackDate(e.target.value)}
            disabled={isSubmitting}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback-source-type" className="text-xs font-semibold">
            Source Channel <span className="text-destructive">*</span>
          </Label>
          <select
            id="feedback-source-type"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as FeedbackSourceType)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {feedbackSourceTypeEnum.options.map((option) => (
              <option key={option} value={option}>
                {feedbackSourceLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provenance Classification */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Provenance Classification <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {feedbackProvenanceEnum.options.map((option) => {
            const isChecked = provenance === option;
            const isQuote = option === "exact_quote";
            return (
              <label
                key={option}
                htmlFor={`provenance-${option}`}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${
                  isChecked
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  id={`provenance-${option}`}
                  name="provenance"
                  value={option}
                  checked={isChecked}
                  onChange={() => setProvenance(option)}
                  disabled={isSubmitting}
                  className="mt-0.5 size-4 accent-primary"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-foreground">
                    {feedbackProvenanceLabels[option]}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted-foreground">
                    {isQuote
                      ? "Verbatim quote or direct excerpt from employer communication"
                      : "Paraphrased recollection or personal summary of what was shared"}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Feedback Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="feedback-text" className="text-xs font-semibold">
            Feedback Content <span className="text-destructive">*</span>
          </Label>
          <span
            className={`text-xs ${
              text.length > 5000 ? "text-destructive font-semibold" : "text-muted-foreground"
            }`}
          >
            {text.length} / 5,000
          </span>
        </div>
        <Textarea
          id="feedback-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            provenance === "exact_quote"
              ? "Paste verbatim excerpts from interviewer notes or rejection correspondence (excluding recruiter contact details)..."
              : "Summarize the key points and takeaways communicated by the interviewer or recruiter..."
          }
          rows={5}
          disabled={isSubmitting}
          required
          maxLength={5000}
          className="resize-y text-sm font-sans"
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
              ? "Save Changes"
              : "Save Feedback"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function FeedbackFormDialog({
  open,
  onOpenChange,
  opportunityId,
  feedback,
  onSuccess,
}: FeedbackFormDialogProps) {
  const isEditing = Boolean(feedback);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employer Feedback" : "Record Employer Feedback"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details, provenance classification, or content of this feedback entry."
              : "Capture quoted or summarized employer feedback as a reported observation for this opportunity."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <FeedbackForm
            opportunityId={opportunityId}
            feedback={feedback}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
