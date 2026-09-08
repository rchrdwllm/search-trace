import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-3xl font-semibold">Sign in to SearchTrace</h1>
      <SignInForm next={params.next} />
      <p className="mt-6 text-sm">
        Need an account?{" "}
        <Link className="underline" href="/sign-up">
          Create one
        </Link>
      </p>
    </main>
  );
}
