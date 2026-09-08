import { z } from "zod";

export const evidenceTypeEnum = z.enum([
  "project",
  "accomplishment",
  "portfolio_link",
]);

export type EvidenceType = z.infer<typeof evidenceTypeEnum>;

export const httpsUrlSchema = z
  .string()
  .trim()
  .url("Source URL must be a valid URL")
  .refine((url) => url.startsWith("https://"), {
    message: "Source URL must use HTTPS",
  })
  .max(500, "Source URL must be 500 characters or fewer")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val === "" || val === undefined ? undefined : val));

export const createEvidenceItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be 2,000 characters or fewer"),
  type: evidenceTypeEnum,
  sourceUrl: httpsUrlSchema,
});

export type CreateEvidenceItemInput = z.infer<typeof createEvidenceItemSchema>;

export const updateEvidenceItemSchema = z.object({
  id: z.string().trim().min(1, "Evidence item ID is required"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be 2,000 characters or fewer"),
  type: evidenceTypeEnum,
  sourceUrl: httpsUrlSchema,
});

export type UpdateEvidenceItemInput = z.infer<typeof updateEvidenceItemSchema>;

export const attachEvidenceInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
  evidenceItemId: z.string().trim().min(1, "Evidence item ID is required"),
});

export type AttachEvidenceInput = z.infer<typeof attachEvidenceInputSchema>;

export const detachEvidenceInputSchema = z.object({
  opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
  evidenceItemId: z.string().trim().min(1, "Evidence item ID is required"),
});

export type DetachEvidenceInput = z.infer<typeof detachEvidenceInputSchema>;

export const createAndAttachEvidenceInputSchema = createEvidenceItemSchema.extend({
  opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
});

export type CreateAndAttachEvidenceInput = z.infer<
  typeof createAndAttachEvidenceInputSchema
>;
