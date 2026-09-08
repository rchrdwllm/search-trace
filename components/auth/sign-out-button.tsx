"use client";
import { useActionState } from "react";
import { signOutAction } from "@/app/(auth)/actions";
export function SignOutButton() {
  const [state, action, pending] = useActionState(signOutAction, undefined);
  return <form action={action}><button type="submit" disabled={pending} className="rounded border px-3 py-2">{pending ? "Signing out…" : "Sign out"}</button>{state?.error && <p role="alert">{state.error}</p>}</form>;
}
