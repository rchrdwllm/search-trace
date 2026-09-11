"use client";

import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { Separator } from "@/components/ui/separator";

export function AppHeader({ currentLocation }: { currentLocation: string }) {
  return (
    <header className="mb-6 flex min-w-0 flex-wrap items-center gap-3 px-1 md:px-2">
      <div className="flex min-w-0 items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          aria-hidden="true"
          className="h-4"
          orientation="vertical"
        />
        <AppBreadcrumbs currentLocation={currentLocation} />
      </div>
    </header>
  );
}
