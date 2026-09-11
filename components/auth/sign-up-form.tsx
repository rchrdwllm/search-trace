"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate aria-busy={pending}>
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
          <Input id="sign-up-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" aria-invalid={Boolean(error)} className="h-12" />
        </Field>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
          <Input id="sign-up-password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Create a password" aria-invalid={Boolean(error)} aria-describedby="password-help" className="h-12" />
          <FieldDescription id="password-help">Use at least 8 characters. A longer, unique password is best.</FieldDescription>
        </Field>
      </FieldGroup>
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      <Button type="submit" disabled={pending} size="lg" className="h-auto min-h-12 max-h-none w-full px-3 py-3">
        {pending ? <><Spinner data-icon="inline-start" />Creating account…</> : <>Create account<ArrowRightIcon data-icon="inline-end" /></>}
      </Button>
    </form>
  );
}
