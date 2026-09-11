import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthPageShell
      eyebrow="Private application workspace"
      title={<>Return to your <em className="text-primary">application workspace.</em></>}
      description="Review your opportunities, evidence, and saved requirement analyses."
      alternatePrompt="New to SearchTrace?"
      alternateLabel="Create your workspace"
      alternateHref="/sign-up"
      panelSignal="Evidence, not assumptions."
      panelIndex="01 / Return"
      panelTitle={<>Review the case you plan to <em className="text-primary">make.</em></>}
      panelDescription="Each opportunity keeps its job requirements, résumé, and supporting evidence together."
      panelLabel="One opportunity at a time"
      steps={[
        { title: "Opportunity", description: "Role requirements stay in context." },
        { title: "Evidence", description: "See what is supported or missing." },
        { title: "Next action", description: "Review one practical improvement." },
      ]}
      panelFooter="Cited. Reviewable. Your decision."
    >
      <SignInForm next={params.next} />
    </AuthPageShell>
  );
}
