import "server-only";

/**
 * Normalizes text by collapsing all consecutive whitespace characters (including newlines and tabs)
 * into single standard spaces and trimming edges.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Validates whether an excerpt is an authentic verbatim quotation from the given job description.
 *
 * Checks:
 * 1. Immediate exact substring match (preserves exact casing and spacing).
 * 2. Whitespace-normalized match (protects against superficial tokenization whitespace/CRLF differences).
 *
 * Rejects empty, whitespace-only, or fabricated citations.
 */
export function verifyCitation(jobDescription: string, excerpt: string): boolean {
  if (!jobDescription || !excerpt) {
    return false;
  }

  const trimmedExcerpt = excerpt.trim();
  if (trimmedExcerpt.length === 0) {
    return false;
  }

  // 1. Direct exact substring match
  if (jobDescription.includes(trimmedExcerpt)) {
    return true;
  }

  // 2. Whitespace-normalized comparison
  const normalizedJd = normalizeWhitespace(jobDescription);
  const normalizedExcerpt = normalizeWhitespace(trimmedExcerpt);

  if (normalizedExcerpt.length === 0) {
    return false;
  }

  return normalizedJd.includes(normalizedExcerpt);
}
