# AI Extractor Contract: Vercel AI SDK with Google Gemini 3.6 Flash

**Feature**: Requirement Extraction from Job Description  
**Branch**: `007-requirement-extraction`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Provider & Model Configuration

- **Framework**: Vercel AI SDK (`ai`)
- **Model Provider**: `@ai-sdk/google` (`google("gemini-3.6-flash")`)
- **Configurable Model Name**: Environment variable `GEMINI_MODEL` (defaults to `"gemini-3.6-flash"`)
- **API Key**: Server-only environment variable `GOOGLE_GENERATIVE_AI_API_KEY` (or `GEMINI_API_KEY`)
- **Generation Method**: `generateObject()` with Zod schema validation
- **Generation Settings**:
  - `temperature`: `0.1` (low temperature to prioritize verbatim fidelity)
  - `maxTokens`: `2048`

---

## 2. Vercel AI SDK Structured Schema

```typescript
import { z } from "zod";

export const requirementCategoryEnum = z.enum([
  "technical_skill",
  "experience",
  "education",
  "responsibility",
  "other",
]);

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
```

---

## 3. Invocation Pattern

```typescript
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { extractedRequirementsDraftSchema } from "@/lib/validations/requirement";

export async function extractWithVercelAiSdk(jobDescription: string) {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  return await generateObject({
    model: google(modelName),
    schema: extractedRequirementsDraftSchema,
    system: `You are an expert technical recruiter and evidence-gap analyzer for software engineering roles.
Your task is to analyze the provided job description and extract 5 to 12 distinct role requirements.

RULES:
1. Every requirement MUST be classified into exactly one category: 'technical_skill', 'experience', 'education', 'responsibility', or 'other'.
2. For EVERY requirement, you MUST provide an exact verbatim excerpt from the job description in 'jobDescriptionExcerpt'.
3. The excerpt MUST be copied word-for-word from the text. DO NOT paraphrase, summarize, or edit the quoted text.
4. Extract between 5 and 12 requirements. Prioritize substantive technical skills and concrete qualifications.
5. NEVER invent requirements or citations not present in the supplied text.`,
    prompt: `Extract the role requirements from the following job description:\n\n--- BEGIN JOB DESCRIPTION ---\n${jobDescription}\n--- END JOB DESCRIPTION ---`,
    temperature: 0.1,
  });
}
```

---

## 4. Citation Verification Algorithm

Server-side verification executes immediately upon receiving model output before any data is sent to the client:

```typescript
export function verifyCitation(jobDescription: string, excerpt: string): boolean {
  if (!excerpt || excerpt.trim().length === 0) return false;

  // 1. Direct exact match
  if (jobDescription.includes(excerpt)) {
    return true;
  }

  // 2. Whitespace-normalized match (collapses \r\n, tabs, multiple spaces)
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
  const normalizedJd = normalize(jobDescription);
  const normalizedExcerpt = normalize(excerpt);

  return normalizedJd.includes(normalizedExcerpt);
}
```

---

## 5. Mock & Offline Test Provider (`InMemoryAiExtractor`)

To ensure the repository's offline quality gate (`bun run check`) executes without network access, credentials, or API keys:

```typescript
export interface AiExtractorService {
  extractRequirements(input: { jobDescription: string }): Promise<Array<{
    title: string;
    category: RequirementCategory;
    jobDescriptionExcerpt: string;
    orderIndex: number;
  }>>;
}
```

- When `process.env.AI_PROVIDER === "memory"` or API keys are undefined in test mode, `InMemoryAiExtractor` is automatically selected.
- Vercel AI SDK's `MockLanguageModelV1` can additionally be used to test low-level AI SDK pipeline integration without network calls.
