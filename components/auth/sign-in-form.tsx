"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate aria-busy={pending}>
      <input type="hidden" name="next" value={next} />
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
          <Input id="sign-in-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" aria-invalid={Boolean(error)} className="h-12" />
        </Field>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
          <Input id="sign-in-password" name="password" type="password" required autoComplete="current-password" placeholder="Enter your password" aria-invalid={Boolean(error)} className="h-12" />
        </Field>
      </FieldGroup>
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? <><Spinner data-icon="inline-start" />Signing in…</> : <>Sign in<ArrowRightIcon data-icon="inline-end" /></>}
      </Button>
    </form>
  );
}
