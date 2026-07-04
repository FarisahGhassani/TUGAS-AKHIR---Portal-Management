import { listAdminNotifications } from "@/server/db/notifications";

// Notifikasi admin dari MySQL (pendaftaran + inquiry terbaru). Jangan cache.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listAdminNotifications());
}
