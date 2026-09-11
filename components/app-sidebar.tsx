"use client";

import { NavGroup } from "@/components/nav-group";
import { LogoIcon } from "@/components/logo";
import { navGroups } from "@/components/app-shared";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AppSidebar() {
  return (
    <Sidebar aria-label="Primary navigation" collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="#main-content" aria-label="SearchTrace foundation overview">
                <LogoIcon aria-hidden="true" />
                <span className="font-semibold tracking-tight">SearchTrace</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Primary navigation">
          {navGroups.map((group) => (
            <NavGroup key={group.label} {...group} />
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <SignOutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
