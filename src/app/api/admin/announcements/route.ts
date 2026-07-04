import { createAnnouncement } from "@/server/db/announcements";
import type { AnnouncementInput } from "@/store/api/announcementsApi";

export const dynamic = "force-dynamic";

// Buat pengumuman baru → langsung masuk store server yang dibaca landing page.
export async function POST(request: Request) {
  const body = (await request.json()) as AnnouncementInput;
  if (
    !body.judul?.trim() ||
    !body.ringkasan?.trim() ||
    !body.fotoPoster?.trim() ||
    !body.tanggalBerakhir
  ) {
    return Response.json(
      { message: "Title, summary, poster, and deadline are required." },
      { status: 422 },
    );
  }
  const created = await createAnnouncement({
    judul: body.judul.trim(),
    ringkasan: body.ringkasan.trim(),
    fotoPoster: body.fotoPoster,
    link: body.link?.trim() || "/auth",
    tanggalBerakhir: body.tanggalBerakhir,
    status: body.status ?? "aktif",
  });
  return Response.json(created, { status: 201 });
}
