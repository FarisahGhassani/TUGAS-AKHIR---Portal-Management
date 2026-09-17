import {
  updateTalentApplication,
  getTalentApplicationDetail,
} from "@/server/db/talents";
import type { TalentApplicationStatus } from "@/store/api/talentApi";

export const dynamic = "force-dynamic";

// "submitted" TIDAK ada di sini: status itu terbentuk otomatis saat pelamar
// mengirim form, bukan sesuatu yang bisa dipilih admin. Admin hanya memproses
// (in_progress) lalu memutuskan (accepted/rejected).
const ALLOWED: TalentApplicationStatus[] = [
  "in_progress",
  "accepted",
  "rejected",
];

// Detail data submitted (untuk modal review admin).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detail = await getTalentApplicationDetail(id);
  if (!detail) {
    return Response.json(
      { message: "Pendaftaran tidak ditemukan." },
      { status: 404 },
    );
  }
  return Response.json(detail);
}

// Admin memutuskan pendaftaran talent: in_progress / accepted / rejected.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { status?: TalentApplicationStatus };
  if (!body.status || !ALLOWED.includes(body.status)) {
    return Response.json({ message: "Status tidak valid." }, { status: 422 });
  }
  const updated = await updateTalentApplication(id, body.status);
  if (!updated) {
    return Response.json(
      { message: "Pendaftaran tidak ditemukan." },
      { status: 404 },
    );
  }
  return Response.json(updated);
}
