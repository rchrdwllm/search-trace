import { requireSession } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <section className="mx-auto w-full max-w-3xl" aria-labelledby="dashboard-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Private workspace</p>
          <h1 id="dashboard-title" className="text-3xl font-semibold">
            Welcome, {session.user.name}
          </h1>
        </div>
        <SignOutButton />
      </div>
      <p className="mt-8">Your SearchTrace workspace is ready.</p>
    </section>
  );
}
