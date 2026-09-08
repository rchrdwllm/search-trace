import { z } from "zod";

export const opportunityStatusEnum = z.enum([
  "draft",
  "applied",
  "interviewing",
  "rejected",
  "closed",
]);

export type OpportunityStatus = z.infer<typeof opportunityStatusEnum>;

export const createOpportunityInputSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be 100 characters or fewer"),
  role: z
    .string()
    .trim()
    .min(1, "Role title is required")
    .max(100, "Role title must be 100 characters or fewer"),
  jobDescription: z
    .string()
    .trim()
    .min(1, "Job description is required"),
  sourceUrl: z
    .string()
    .trim()
    .url("Source URL must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Source URL must use HTTPS",
    })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? undefined : val)),
  status: opportunityStatusEnum.default("draft"),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunityInputSchema>;

export const updateOpportunityInputSchema = z.object({
  id: z.string().min(1, "Opportunity ID is required"),
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be 100 characters or fewer"),
  role: z
    .string()
    .trim()
    .min(1, "Role title is required")
    .max(100, "Role title must be 100 characters or fewer"),
  jobDescription: z
    .string()
    .trim()
    .min(1, "Job description is required"),
  sourceUrl: z
    .string()
    .trim()
    .url("Source URL must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Source URL must use HTTPS",
    })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? undefined : val)),
  status: opportunityStatusEnum.default("draft"),
});

export type UpdateOpportunityInput = z.infer<typeof updateOpportunityInputSchema>;
