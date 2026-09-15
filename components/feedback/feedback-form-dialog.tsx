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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CalendarIcon } from "lucide-react";

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

function parseIsoDate(value: string): Date | undefined {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return "Pick a date";
  return new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
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
  const [isDateOpen, setIsDateOpen] = useState(false);
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
      <p className="sr-only">
        <strong>Privacy Notice:</strong> Please do not paste recruiter email
        addresses, phone numbers, signatures, or private email headers. Keep
        feedback focused on role and evaluation content.
      </p>

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
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="feedback-date"
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full justify-between font-normal"
                aria-label="Date Received"
              >
                {formatDateLabel(feedbackDate)}
                <CalendarIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseIsoDate(feedbackDate)}
                onSelect={(date) => {
                  setFeedbackDate(formatIsoDate(date));
                  setIsDateOpen(false);
                }}
                defaultMonth={parseIsoDate(feedbackDate)}
              />
            </PopoverContent>
          </Popover>
          <input
            type="hidden"
            name="feedbackDate"
            value={feedbackDate}
            readOnly
            aria-hidden="true"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback-source-type" className="text-xs font-semibold">
            Source Channel <span className="text-destructive">*</span>
          </Label>
          <Select
            value={sourceType}
            onValueChange={(value) => setSourceType(value as FeedbackSourceType)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="feedback-source-type" className="w-full">
              <SelectValue placeholder="Select source channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {feedbackSourceTypeEnum.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {feedbackSourceLabels[option]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Provenance Classification */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Provenance Classification <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <DialogFooter className="gap-3 pt-2">
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
