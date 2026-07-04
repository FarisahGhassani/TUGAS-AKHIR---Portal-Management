import {
  listActiveAnnouncements,
  listAllAnnouncements,
} from "@/server/db/announcements";

// Dibaca landing page & panel admin dari MySQL via Prisma — jangan cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  // `?status=aktif` (landing) → hanya aktif & belum lewat deadline.
  // tanpa param (admin) → semua pengumuman untuk dikelola.
  const data =
    status === "aktif"
      ? await listActiveAnnouncements()
      : await listAllAnnouncements();
  return Response.json(data);
}
