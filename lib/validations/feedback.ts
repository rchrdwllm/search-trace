import { z } from "zod";

export const feedbackSourceTypeEnum = z.enum([
  "recruiter_feedback",
  "rejection_note",
  "interview_feedback",
  "user_summary",
]);

export type FeedbackSourceType = z.infer<typeof feedbackSourceTypeEnum>;

export const feedbackProvenanceEnum = z.enum([
  "exact_quote",
  "personal_summary",
]);

export type FeedbackProvenance = z.infer<typeof feedbackProvenanceEnum>;

export const feedbackDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const feedbackTextSchema = z
  .string()
  .trim()
  .min(1, "Feedback text is required")
  .max(5000, "Feedback text must be 5,000 characters or fewer");

export const createFeedbackItemSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
  feedbackDate: feedbackDateSchema,
  text: feedbackTextSchema,
  sourceType: feedbackSourceTypeEnum,
  provenance: feedbackProvenanceEnum,
  aiOptIn: z.boolean().default(false),
});

export type CreateFeedbackItemInput = z.infer<typeof createFeedbackItemSchema>;

export const updateFeedbackItemSchema = z.object({
  id: z.string().trim().min(1, "Feedback item ID is required"),
  feedbackDate: feedbackDateSchema,
  text: feedbackTextSchema,
  sourceType: feedbackSourceTypeEnum,
  provenance: feedbackProvenanceEnum,
});

export type UpdateFeedbackItemInput = z.infer<typeof updateFeedbackItemSchema>;

export const setFeedbackAiOptInSchema = z.object({
  id: z.string().trim().min(1, "Feedback item ID is required"),
  aiOptIn: z.boolean(),
});

export type SetFeedbackAiOptInInput = z.infer<typeof setFeedbackAiOptInSchema>;

export const deleteFeedbackItemSchema = z.object({
  id: z.string().trim().min(1, "Feedback item ID is required"),
});

export type DeleteFeedbackItemInput = z.infer<typeof deleteFeedbackItemSchema>;

export const listFeedbackItemsSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
});

export type ListFeedbackItemsInput = z.infer<typeof listFeedbackItemsSchema>;

export const getFeedbackItemByIdSchema = z.object({
  id: z.string().trim().min(1, "Feedback item ID is required"),
});

export type GetFeedbackItemByIdInput = z.infer<typeof getFeedbackItemByIdSchema>;
