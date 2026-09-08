"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  credentialsSchema,
  genericAuthError,
  safeReturnPath,
} from "@/lib/auth/validation";

function values(formData: FormData) {
  return { email: formData.get("email"), password: formData.get("password") };
}

export async function signUpAction(
  _previous: { error: string } | undefined,
  formData: FormData,
) {
  const parsed = credentialsSchema.safeParse(values(formData));
  if (!parsed.success)
    return {
      error: "Enter a valid email and a password of at least 8 characters.",
    };

  try {
    await auth.api.signUpEmail({
      headers: await headers(),
      body: { ...parsed.data, name: parsed.data.email.split("@")[0] },
    });
  } catch (e) {
    console.log({ e })
    return { error: genericAuthError() };
  }

  redirect("/dashboard");
}
export async function signInAction(
  _previous: { error: string; next: string } | undefined,
  formData: FormData,
) {
  const parsed = credentialsSchema.safeParse(values(formData));
  const next = safeReturnPath(formData.get("next"));

  if (!parsed.success)
    return { error: "Enter a valid email and password.", next };

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: { ...parsed.data, rememberMe: true },
    });
  } catch {
    return { error: genericAuthError(), next };
  }

  redirect(next);
}
export async function signOutAction(_previous: { error: string } | undefined) {
  void _previous;

  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    return { error: genericAuthError() };
  }

  redirect("/sign-in");
}
