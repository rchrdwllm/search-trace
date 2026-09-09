import "server-only";

/**
 * Normalizes text by collapsing all consecutive whitespace characters (including newlines and tabs)
 * into single standard spaces and trimming edges.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Validates whether an excerpt is an authentic verbatim quotation from the given source text.
 *
 * Checks:
 * 1. Immediate exact substring match (preserves exact casing and spacing).
 * 2. Whitespace-normalized match (protects against superficial tokenization whitespace/CRLF differences).
 *
 * Rejects empty, whitespace-only, or fabricated citations.
 */
export function verifyCitation(sourceText: string, excerpt: string): boolean {
  if (!sourceText || !excerpt) {
    return false;
  }

  const trimmedExcerpt = excerpt.trim();
  if (trimmedExcerpt.length === 0) {
    return false;
  }

  // 1. Direct exact substring match
  if (sourceText.includes(trimmedExcerpt)) {
    return true;
  }

  // 2. Whitespace-normalized comparison
  const normalizedSource = normalizeWhitespace(sourceText);
  const normalizedExcerpt = normalizeWhitespace(trimmedExcerpt);

  if (normalizedExcerpt.length === 0) {
    return false;
  }

  return normalizedSource.includes(normalizedExcerpt);
}

export interface CandidateSources {
  resumeText?: string | null;
  evidenceItems?: Array<{ id: string; description: string; title?: string }>;
  feedbackItems?: Array<{ id: string; text: string }>;
}

export interface CandidateCitationCheck {
  source: "resume" | "evidence" | "feedback";
  sourceId?: string | null;
  excerpt: string;
}

/**
 * Verifies that a citation excerpt authentically exists verbatim in the candidate's authorized sources:
 * - If source is 'resume', checks candidate's reviewed résumé text.
 * - If source is 'evidence', checks matching or attached evidence item descriptions.
 * - If source is 'feedback', checks matching or opted-in feedback items.
 */
export function verifyMultiSourceCitation(
  sources: CandidateSources,
  citation: CandidateCitationCheck
): boolean {
  if (!citation || !citation.excerpt) {
    return false;
  }

  const trimmedExcerpt = citation.excerpt.trim();
  if (trimmedExcerpt.length === 0) {
    return false;
  }

  if (citation.source === "resume") {
    if (!sources.resumeText) {
      return false;
    }
    return verifyCitation(sources.resumeText, trimmedExcerpt);
  }

  if (citation.source === "evidence") {
    if (!sources.evidenceItems || sources.evidenceItems.length === 0) {
      return false;
    }
    if (citation.sourceId) {
      const item = sources.evidenceItems.find((e) => e.id === citation.sourceId);
      if (item) {
        return (
          verifyCitation(item.description, trimmedExcerpt) ||
          verifyCitation(item.title || "", trimmedExcerpt)
        );
      }
    }
    return sources.evidenceItems.some(
      (item) =>
        verifyCitation(item.description, trimmedExcerpt) ||
        verifyCitation(item.title || "", trimmedExcerpt)
    );
  }

  if (citation.source === "feedback") {
    if (!sources.feedbackItems || sources.feedbackItems.length === 0) {
      return false;
    }
    if (citation.sourceId) {
      const item = sources.feedbackItems.find((f) => f.id === citation.sourceId);
      if (item) {
        return verifyCitation(item.text, trimmedExcerpt);
      }
    }
    return sources.feedbackItems.some((item) =>
      verifyCitation(item.text, trimmedExcerpt)
    );
  }

  return false;
}
