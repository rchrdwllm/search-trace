"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  credentialsSchema,
  genericAuthError,
  safeReturnPath,
} from "@/lib/auth/validation";

export function SignInForm({ next = "" }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const parsed = credentialsSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) return setError("Enter a valid email and password.");
    setPending(true);
    try {
      const result = await authClient.signIn.email({
        ...parsed.data,
        rememberMe: true,
      });
      if (result.error) return setError(genericAuthError());
      router.replace(safeReturnPath(next));
      router.refresh();
    } catch {
      setError(genericAuthError());
    } finally {
      setPending(false);
    }
  }
  
  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <label className="grid gap-1">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border p-2"
        />
      </label>
      <label className="grid gap-1">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border p-2"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
