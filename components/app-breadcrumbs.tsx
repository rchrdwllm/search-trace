import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumbs({ currentLocation }: { currentLocation: string }) {
  return (
    <Breadcrumb aria-label="Current location">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLocation}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
