import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumbs() {
  return (
    <Breadcrumb aria-label="Current location">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Foundation overview</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
