import { updateInquiry } from "@/server/db/inquiries";
import type { InquiryStatus } from "@/store/api/inquiryApi";

export const dynamic = "force-dynamic";

// "submitted" bukan pilihan admin — status itu otomatis terpasang saat klien
// mengirim form kolaborasi. Admin hanya menindaklanjuti: in_progress → completed.
const ALLOWED: InquiryStatus[] = ["in_progress", "completed"];

// Admin menindaklanjuti: ubah status (diproses→selesai) dan/atau catatan
// internal yang ikut dipantau client.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    status?: InquiryStatus;
    catatanAdmin?: string;
  };
  if (body.status !== undefined && !ALLOWED.includes(body.status)) {
    return Response.json({ message: "Status tidak valid." }, { status: 422 });
  }
  const updated = await updateInquiry(id, body);
  if (!updated) {
    return Response.json(
      { message: "Inquiry tidak ditemukan." },
      { status: 404 },
    );
  }
  return Response.json(updated);
}
