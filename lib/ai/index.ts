import "server-only";

import type { AiExtractorService, AiAnalyzerService } from "./types";
import { GeminiAiExtractor } from "./gemini";
import { InMemoryAiExtractor, InMemoryAiAnalyzer } from "./mock";
import { GeminiAiAnalyzer } from "./analyzer";

let currentExtractor: AiExtractorService | null = null;
let currentAnalyzer: AiAnalyzerService | null = null;

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

export function getAiAnalyzerService(): AiAnalyzerService {
  if (currentAnalyzer) {
    return currentAnalyzer;
  }

  const isTest = process.env.NODE_ENV === "test";
  const provider = process.env.AI_PROVIDER;
  const hasKey = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  );

  if (isTest || provider === "memory" || !hasKey) {
    currentAnalyzer = new InMemoryAiAnalyzer();
    return currentAnalyzer;
  }

  currentAnalyzer = new GeminiAiAnalyzer();
  return currentAnalyzer;
}

export function setAiAnalyzerService(service: AiAnalyzerService | null): void {
  currentAnalyzer = service;
}

export * from "./types";
export * from "./gemini";
export * from "./analyzer";
export * from "./mock";
export * from "./rate-limiter";
