"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { credentialsSchema, genericAuthError } from "@/lib/auth/validation";
export function SignUpForm() {
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
    if (!parsed.success)
      return setError(
        "Enter a valid email and a password of at least 8 characters.",
      );
    setPending(true);
    try {
      const result = await authClient.signUp.email({
        ...parsed.data,
        name: parsed.data.email.split("@")[0],
      });
      if (result.error) return setError(genericAuthError());
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(genericAuthError());
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
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
          minLength={8}
          autoComplete="new-password"
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
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
