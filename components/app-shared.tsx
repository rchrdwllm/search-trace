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
        path: "#main-content",
        isActive: true,
        icon: "overview",
      },
      {
        title: "Evidence Library",
        path: "/dashboard/evidence",
        icon: "workspace",
      },
    ],
  },
  {
    label: "Coming next",
    description: "Future screens are not available in this foundation release.",
    items: [
      { title: "Opportunity review", disabled: true, icon: "opportunity" },
    ],
  },
];

export const navLinks = navGroups.flatMap((group) => group.items);
