"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { genericAuthError } from "@/lib/auth/validation";
export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setError(undefined);
    setPending(true);
    try {
      const result = await authClient.signOut();
      if (result.error) return setError(genericAuthError());
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError(genericAuthError());
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        className="rounded border px-3 py-2"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
