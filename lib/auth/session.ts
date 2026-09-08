import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const { auth } = await import("@/lib/auth");

  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();

  if (!session) redirect("/sign-in");

  return session;
}
