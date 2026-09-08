import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export function safeReturnPath(
  value: FormDataEntryValue | string | null | undefined,
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/dashboard";

  try {
    const url = new URL(value, "http://localhost");

    return url.origin === "http://localhost"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export function genericAuthError() {
  return "Unable to complete that request. Check your details and try again.";
}
