import type { AgencyInfo } from "@/store/api/agencyApi";

// Identitas & kontak agency. Statis (tidak ada tabelnya di ERD) tapi disajikan
// lewat route handler /api/agency supaya Footer tetap memakai satu jalur data
// yang sama (RTK Query) dan tetap hidup di build produksi.
export const agencyInfo: AgencyInfo = {
  name: "PORTAL MANAGEMENT",
  tagline: "Talent dan Model Agency",
  location: {
    city: "Semarang",
    country: "Indonesia",
  },
  contact: {
    whatsapp: {
      displayLabel: "+62 812-3340-7992",
      number: "6281233407992",
    },
    instagram: {
      handle: "@portal.management",
      url: "https://www.instagram.com/portal.management",
    },
    tiktok: {
      handle: "@portal.management",
      url: "https://www.tiktok.com/@portal.management",
    },
  },
};
