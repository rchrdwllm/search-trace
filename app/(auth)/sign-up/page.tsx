import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-3xl font-semibold">Create your account</h1>
      <p className="mb-6 text-muted-foreground">
        Registration signs you in immediately.
      </p>
      <SignUpForm />
      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link className="underline" href="/sign-in">
          Sign in
        </Link>
      </p>
    </main>
  );
}
