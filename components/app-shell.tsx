"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({
  children,
  currentLocation = "Foundation overview",
}: {
  children: ReactNode;
  currentLocation?: string;
}) {
  return (
    <>
      <a
        className="fixed left-3 top-3 z-50 -translate-y-24 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
          window.history.replaceState(null, "", "#main-content");
        }}
      >
        Skip to main content
      </a>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset id="main-content" tabIndex={-1}>
            <div className="min-w-0 p-4 md:p-6">
              <AppHeader currentLocation={currentLocation} />
              <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  );
}
