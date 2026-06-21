import {
  ApplicationIcon,
  GridIcon,
  InboxIcon,
  ListIcon,
  MetricsIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/dashboard/icons";
import type { DashboardNavSection } from "@/components/dashboard/DashboardShell";

export const adminSections: DashboardNavSection[] = [
  {
    heading: "AGENCY",
    items: [
      { label: "OVERVIEW", href: "/admin", icon: <GridIcon /> },
      {
        label: "ANNOUNCEMENTS",
        href: "/admin/announcements",
        icon: <ListIcon />,
      },
    ],
  },
  {
    heading: "PEOPLE",
    items: [
      { label: "ACCOUNTS", href: "/admin/accounts", icon: <ApplicationIcon /> },
      { label: "TALENT", href: "/admin/talent", icon: <UsersIcon /> },
      { label: "CLIENTS", href: "/admin/clients", icon: <InboxIcon /> },
    ],
  },
  {
    heading: "OPERATIONS",
    items: [
      { label: "CLASSES", href: "/admin/classes", icon: <MetricsIcon /> },
    ],
  },
];

export const adminFooterItems = [
  { label: "SETTINGS", href: "/admin/settings", icon: <SettingsIcon /> },
];



