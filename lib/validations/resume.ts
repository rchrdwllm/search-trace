import { z } from "zod";

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024; // 10 MB (10,485,760 bytes)

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;

export const extractionStateEnum = z.enum(["pending", "ready", "failed"]);
export type ExtractionState = z.infer<typeof extractionStateEnum>;

export const resumeOpportunityInputSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
});

export type ResumeOpportunityInput = z.infer<typeof resumeOpportunityInputSchema>;

export const updateReviewedTextInputSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  reviewedText: z.string().trim().min(1, "Reviewed text cannot be empty"),
});

export type UpdateReviewedTextInput = z.infer<typeof updateReviewedTextInputSchema>;

export const setAiOptInInputSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  enabled: z.boolean(),
});

export type SetAiOptInInput = z.infer<typeof setAiOptInInputSchema>;
