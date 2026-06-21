import { createAnnouncement } from "@/server/store";
import type { AnnouncementInput } from "@/store/api/announcementsApi";

export const dynamic = "force-dynamic";

// Buat pengumuman baru → langsung masuk store server yang dibaca landing page.
export async function POST(request: Request) {
  const body = (await request.json()) as AnnouncementInput;
  if (
    !body.judul?.trim() ||
    !body.ringkasan?.trim() ||
    !body.kategori ||
    !body.fotoPoster?.trim() ||
    !body.tanggalBerakhir
  ) {
    return Response.json(
      { message: "Title, summary, category, poster, and deadline are required." },
      { status: 422 },
    );
  }
  const created = createAnnouncement({
    judul: body.judul.trim(),
    ringkasan: body.ringkasan.trim(),
    kategori: body.kategori,
    fotoPoster: body.fotoPoster,
    fotoPosterAlt: body.fotoPosterAlt?.trim() || body.judul.trim(),
    link: body.link?.trim() || "/auth",
    tanggalBerakhir: body.tanggalBerakhir,
    status: body.status ?? "aktif",
  });
  return Response.json(created, { status: 201 });
}
