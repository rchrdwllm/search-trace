import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Prepare with evidence"
      title={<>Build a clearer case <em className="text-primary">for your next application.</em></>}
      description="Create a private workspace to compare one role’s requirements with the résumé and evidence you plan to submit."
      alternatePrompt="Already have a workspace?"
      alternateLabel="Sign in"
      alternateHref="/sign-in"
      panelSignal="Your materials. Your decision."
      panelIndex="02 / Begin"
      panelTitle={<>Know what your application can <em className="text-primary">support.</em></>}
      panelDescription="SearchTrace separates submitted evidence from assumptions before you apply."
      panelLabel="Explainable by design"
      steps={[
        { title: "Add one role", description: "Keep its requirements in context." },
        { title: "Select evidence", description: "Choose what you plan to submit." },
        { title: "Review the gaps", description: "Trace every finding to its source." },
      ]}
      panelFooter="Private. Cited. Reviewable."
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
