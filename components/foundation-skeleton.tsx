import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export function FoundationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading foundation preview" role="status">
      <span className="sr-only">Loading foundation preview</span>
      <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Spinner aria-hidden="true" className="mt-4" />
    </div>
  );
}
