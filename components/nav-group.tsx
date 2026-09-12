import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { SidebarNavGroup, SidebarNavItem } from "@/components/app-shared";
import { CircleDashed, FileSearch, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  overview: LayoutDashboard,
  opportunity: FileSearch,
  workspace: CircleDashed,
} as const;

function NavIcon({ item }: { item: SidebarNavItem }) {
  const Icon = icons[item.icon as keyof typeof icons] ?? CircleDashed;
  return <Icon aria-hidden="true" />;
}

export function NavGroup({ label, items, description }: SidebarNavGroup) {
  const pathname = usePathname() ?? "";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      {description ? (
        <p className="px-2 pb-2 text-xs leading-5 text-sidebar-foreground/65 group-data-[collapsible=icon]:sr-only">
          {description}
        </p>
      ) : null}
      <SidebarMenu className="gap-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.disabled ? (
              <SidebarMenuButton
                aria-disabled="true"
                disabled
                title="Unavailable until a later feature"
                type="button"
              >
                <NavIcon item={item} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                isActive={
                  item.path ? pathname === item.path : item.isActive
                }
              >
                <Link href={item.path ?? "#main-content"}>
                  <NavIcon item={item} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
