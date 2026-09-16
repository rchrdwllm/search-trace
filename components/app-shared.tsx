import type { ReactNode } from "react";

export type SidebarNavItem = {
  title: string;
  path?: string;
  icon?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
  description?: string;
};

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Foundation",
    items: [
      {
        title: "Overview",
        path: "/dashboard",
        icon: "overview",
      },
      {
        title: "Evidence Library",
        path: "/evidence",
        icon: "workspace",
      },
    ],
  },
];

export const navLinks = navGroups.flatMap((group) => group.items);
