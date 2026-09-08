"use client";
import { useActionState } from "react";
import { signInAction } from "@/app/(auth)/actions";
export function SignInForm({ next = "" }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, undefined);
  return <form action={action} className="grid gap-4" noValidate>
    <input type="hidden" name="next" value={next} />
    <label className="grid gap-1">Email<input name="email" type="email" required autoComplete="email" className="rounded border p-2" /></label>
    <label className="grid gap-1">Password<input name="password" type="password" required autoComplete="current-password" className="rounded border p-2" /></label>
    {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button type="submit" disabled={pending} className="rounded bg-primary px-4 py-2 text-primary-foreground">{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
