"use client";
import { useState } from "react";
import { genericAuthError } from "@/lib/auth/validation";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
export function SignOutButton() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setError(undefined);
    setPending(true);
    try {
      const { authClient } = await import("@/lib/auth-client");
      const result = await authClient.signOut();
      if (result.error) return setError(genericAuthError());
      // The sidebar is also rendered in shell-only contexts without Next's router provider.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/sign-in");
    } catch {
      setError(genericAuthError());
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        onClick={signOut}
        disabled={pending}
        variant="outline"
        className="w-full justify-start"
      >
        <LogOutIcon data-icon="inline-start" aria-hidden="true" />
        <span className="group-data-[collapsible=icon]:hidden">
          {pending ? "Signing out…" : "Sign out"}
        </span>
      </Button>
      {error && (
        <p role="alert" className="px-2 text-xs text-destructive group-data-[collapsible=icon]:hidden">
          {error}
        </p>
      )}
    </div>
  );
}
