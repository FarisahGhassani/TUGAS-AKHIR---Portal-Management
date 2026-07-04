import { http, HttpResponse, delay } from "msw";
import { agencyInfo } from "./data/agency";

// Hampir semua endpoint kini REAL Next.js Route Handlers (src/app/api/**) yang
// menulis ke MySQL via Prisma: auth, accounts, overview, notifications, talents
// (+approval), projects, announcements, inquiries, dashboard, batches,
// class-registrations, site-assets, landing. MSW (dev-only) tinggal menyajikan
// satu konten statis: /api/agency. `onUnhandledRequest: "bypass"` membuat sisanya
// jatuh ke Route Handler.
export const handlers = [
  http.get("/api/agency", async () => {
    await delay(150);
    return HttpResponse.json(agencyInfo);
  }),
];
