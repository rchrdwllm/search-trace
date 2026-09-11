import { EvidenceLibraryClient } from "@/components/evidence/evidence-library-client";
import { getTRPCCaller } from "@/trpc/server";

export default async function EvidenceLibraryPage() {
  const trpc = await getTRPCCaller();
  const initialEvidence = await trpc.evidence.list();

  return <EvidenceLibraryClient initialEvidence={initialEvidence} />;
}
