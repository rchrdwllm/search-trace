import { requireSession } from "@/lib/auth/session";
import { getTRPCCaller } from "@/trpc/server";
import { EvidenceLibraryClient } from "@/components/evidence/evidence-library-client";

export default async function EvidenceLibraryPage() {
  await requireSession();
  const trpc = await getTRPCCaller();
  const initialEvidence = await trpc.evidence.list();

  return <EvidenceLibraryClient initialEvidence={initialEvidence} />;
}
