import { z } from "zod";

export const requirementCategoryEnum = z.enum([
  "technical_skill",
  "experience",
  "education",
  "responsibility",
  "other",
]);

export type RequirementCategory = z.infer<typeof requirementCategoryEnum>;

export const requirementCategoryLabels: Record<RequirementCategory, string> = {
  technical_skill: "Technical Skill",
  experience: "Experience",
  education: "Education",
  responsibility: "Responsibility",
  other: "Other",
};

export const requirementItemSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z
    .string()
    .trim()
    .min(3, "Requirement title must be at least 3 characters")
    .max(300, "Requirement title must not exceed 300 characters"),
  category: requirementCategoryEnum,
  jobDescriptionExcerpt: z
    .string()
    .trim()
    .min(5, "Citation excerpt must be at least 5 characters")
    .max(1000, "Citation excerpt must not exceed 1000 characters"),
  orderIndex: z.number().int().min(0).default(0),
});

export type RequirementItem = z.infer<typeof requirementItemSchema>;

export const extractRequirementsInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
});

export type ExtractRequirementsInput = z.infer<typeof extractRequirementsInputSchema>;

export const saveRequirementsInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
  requirements: z
    .array(requirementItemSchema)
    .min(1, "At least one requirement must be provided")
    .max(30, "Cannot exceed 30 requirements per opportunity"),
});

export type SaveRequirementsInput = z.infer<typeof saveRequirementsInputSchema>;

export const deleteRequirementInputSchema = z.object({
  id: z.string().trim().min(1, "Requirement identifier is required"),
});

export type DeleteRequirementInput = z.infer<typeof deleteRequirementInputSchema>;

export const getRequirementsInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity identifier is required"),
});

export type GetRequirementsInput = z.infer<typeof getRequirementsInputSchema>;

export const extractedRequirementItemSchema = z.object({
  title: z
    .string()
    .describe("Clear, concise requirement statement, e.g. '5+ years of production experience with TypeScript'"),
  category: requirementCategoryEnum.describe(
    "Classification: technical_skill, experience, education, responsibility, or other"
  ),
  jobDescriptionExcerpt: z
    .string()
    .describe(
      "Exact verbatim quote copied word-for-word from the job description evidencing this requirement"
    ),
});

export const extractedRequirementsDraftSchema = z.object({
  requirements: z
    .array(extractedRequirementItemSchema)
    .min(5, "At least 5 requirements must be extracted")
    .max(12, "At most 12 requirements may be extracted"),
});

export type ExtractedRequirementsDraft = z.infer<typeof extractedRequirementsDraftSchema>;

export const dailyUsageResponseSchema = z.object({
  used: z.number().int().min(0),
  limit: z.number().int().min(1),
  remaining: z.number().int().min(0),
  resetsAt: z.string(),
});

export type DailyUsageResponse = z.infer<typeof dailyUsageResponseSchema>;
