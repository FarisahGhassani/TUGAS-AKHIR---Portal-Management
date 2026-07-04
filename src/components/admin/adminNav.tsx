import {
  ApplicationIcon,
  GridIcon,
  InboxIcon,
  ListIcon,
  MetricsIcon,
  UsersIcon,
  GalleryIcon,
} from "@/components/dashboard/icons";
import type { DashboardNavSection } from "@/components/dashboard/DashboardShell";

export const adminSections: DashboardNavSection[] = [
  {
    heading: "WEBSITE",
    items: [
      { label: "OVERVIEW", href: "/admin", icon: <GridIcon /> },
      {
        label: "ANNOUNCEMENTS",
        href: "/admin/announcements",
        icon: <ListIcon />,
      },
      { label: "PROJECTS", href: "/admin/projects", icon: <GalleryIcon /> },
      { label: "SITE & LANDING", href: "/admin/assets", icon: <ListIcon /> },
    ],
  },
  {
    heading: "MANAGEMENT",
    items: [
      { label: "ACCOUNTS", href: "/admin/accounts", icon: <ApplicationIcon /> },
      { label: "TALENT", href: "/admin/talent", icon: <UsersIcon /> },
      { label: "CLIENTS", href: "/admin/clients", icon: <InboxIcon /> },
      { label: "CLASSES", href: "/admin/classes", icon: <MetricsIcon /> },
    ],
  },
];

// Tidak ada item footer khusus admin saat ini — DashboardShell tetap merender
// tombol Sign Out di bawah.
export const adminFooterItems: { label: string; href: string; icon?: React.ReactNode }[] = [];



