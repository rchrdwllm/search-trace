"use client";
import { useActionState } from "react";
import { signUpAction } from "@/app/(auth)/actions";
export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, undefined);
  return <form action={action} className="grid gap-4" noValidate>
    <label className="grid gap-1">Email<input name="email" type="email" required autoComplete="email" className="rounded border p-2" /></label>
    <label className="grid gap-1">Password<input name="password" type="password" required minLength={8} autoComplete="new-password" className="rounded border p-2" /></label>
    {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button type="submit" disabled={pending} className="rounded bg-primary px-4 py-2 text-primary-foreground">{pending ? "Creating account…" : "Create account"}</button>
  </form>;
}
