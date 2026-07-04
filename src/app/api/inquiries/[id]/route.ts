import { updateInquiry } from "@/server/db/inquiries";
import type { InquiryStatus } from "@/store/api/inquiryApi";

export const dynamic = "force-dynamic";

// Admin menindaklanjuti: ubah status (baru→diproses→selesai) dan/atau catatan
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
  const updated = await updateInquiry(id, body);
  if (!updated) {
    return Response.json(
      { message: "Inquiry tidak ditemukan." },
      { status: 404 },
    );
  }
  return Response.json(updated);
}
