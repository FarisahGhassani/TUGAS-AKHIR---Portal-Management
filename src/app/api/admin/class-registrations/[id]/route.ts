import { updateClassRegistration } from "@/server/db/batches";
import type {
  ClassRegistrationStatus,
  GraduationStatus,
} from "@/store/api/dashboardApi";

export const dynamic = "force-dynamic";

const STATUS: ClassRegistrationStatus[] = [
  "submitted",
  "in_progress",
  "accepted",
  "rejected",
];
const LULUS: GraduationStatus[] = ["belum", "lulus", "tidak_lulus"];

// Admin: approve/reject (status) ATAU set kelulusan + sertifikat untuk
// pendaftaran kelas. Field opsional — kirim yang ingin diubah saja.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    status?: ClassRegistrationStatus;
    statusLulus?: GraduationStatus;
    sertifikatUrl?: string;
  };

  if (body.status !== undefined && !STATUS.includes(body.status)) {
    return Response.json({ message: "Status tidak valid." }, { status: 422 });
  }
  if (body.statusLulus !== undefined && !LULUS.includes(body.statusLulus)) {
    return Response.json(
      { message: "Status kelulusan tidak valid." },
      { status: 422 },
    );
  }

  const updated = await updateClassRegistration(id, body);
  if (!updated) {
    return Response.json(
      { message: "Pendaftaran kelas tidak ditemukan." },
      { status: 404 },
    );
  }
  return Response.json(updated);
}
