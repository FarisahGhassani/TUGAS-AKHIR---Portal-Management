import { updateAnnouncement, deleteAnnouncement } from "@/server/db/announcements";
import type { AnnouncementInput } from "@/store/api/announcementsApi";

export const dynamic = "force-dynamic";

// Edit pengumuman.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<AnnouncementInput>;
  const updated = await updateAnnouncement(id, body);
  if (!updated) {
    return Response.json({ message: "Announcement not found." }, { status: 404 });
  }
  return Response.json(updated);
}

// Hapus pengumuman.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = await deleteAnnouncement(id);
  if (!ok) {
    return Response.json({ message: "Announcement not found." }, { status: 404 });
  }
  return Response.json({ id });
}
