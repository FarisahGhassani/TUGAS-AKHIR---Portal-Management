import {
  listActiveAnnouncements,
  listAllAnnouncements,
} from "@/server/store";

// Dibaca landing page & panel admin dari state server yang hidup — jangan cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  // `?status=aktif` (landing) → hanya aktif & belum lewat deadline.
  // tanpa param (admin) → semua pengumuman untuk dikelola.
  const data =
    status === "aktif" ? listActiveAnnouncements() : listAllAnnouncements();
  return Response.json(data);
}
