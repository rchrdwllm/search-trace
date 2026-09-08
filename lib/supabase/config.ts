export type PublicSupabaseConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

function isAllowedUrl(value: string) {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol === "https:") {
    return true;
  }

  return (
    parsed.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
  );
}

export function validatePublicSupabaseConfig(candidate: {
  url?: string;
  publishableKey?: string;
}): PublicSupabaseConfig {
  const url = candidate.url?.trim() ?? "";
  const publishableKey = candidate.publishableKey?.trim() ?? "";
  const missing: string[] = [];

  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length > 0) {
    throw new SupabaseConfigurationError(
      `Missing ${missing.join(" and ")}. Copy .env.example and provide the public Supabase values.`
    );
  }

  if (!isAllowedUrl(url)) {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL (or HTTP for localhost development). Check .env.example."
    );
  }

  return Object.freeze({ url, publishableKey });
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  return validatePublicSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
