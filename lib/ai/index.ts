import "server-only";

import type { AiExtractorService } from "./types";
import { GeminiAiExtractor } from "./gemini";
import { InMemoryAiExtractor } from "./mock";

let currentExtractor: AiExtractorService | null = null;

export function getAiExtractorService(): AiExtractorService {
  if (currentExtractor) {
    return currentExtractor;
  }

  const isTest = process.env.NODE_ENV === "test";
  const provider = process.env.AI_PROVIDER;
  const hasKey = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  );

  if (isTest || provider === "memory" || !hasKey) {
    currentExtractor = new InMemoryAiExtractor();
    return currentExtractor;
  }

  currentExtractor = new GeminiAiExtractor();
  return currentExtractor;
}

export function setAiExtractorService(service: AiExtractorService | null): void {
  currentExtractor = service;
}

export * from "./types";
export * from "./gemini";
export * from "./mock";
export * from "./rate-limiter";
