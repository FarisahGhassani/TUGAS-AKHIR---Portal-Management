import { createApplication } from "@/server/db/dashboard";
import type { CreateApplicationRequest } from "@/store/api/dashboardApi";

export const dynamic = "force-dynamic";

// Satu endpoint untuk kedua form (talent & kelas) → tabel `pendaftaran`.
// Status awal selalu "pending". userId dari user yang login (dikirim di body).
export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
  } & CreateApplicationRequest;

  const userId = Number(body.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return Response.json(
      { message: "Sesi tidak valid. Silakan login ulang." },
      { status: 401 },
    );
  }

  if (body.jenis === "talent") {
    const ok =
      body.namaTalent?.trim() &&
      body.gender &&
      body.tanggalLahir &&
      body.tinggiBadan &&
      body.beratBadan &&
      body.sizeBaju?.trim() &&
      body.sizeSepatu?.trim() &&
      body.kartuIdentitas?.trim() &&
      body.noTelepon?.trim() &&
      body.instagram?.trim() &&
      body.fotoProfil?.trim();
    if (!ok) {
      return Response.json(
        { message: "Please complete all required talent fields." },
        { status: 422 },
      );
    }
  } else if (body.jenis === "kelas") {
    if (!body.namaTalent?.trim() || !body.noTelepon?.trim() || !body.batchId) {
      return Response.json(
        { message: "Select a batch and complete your details to register." },
        { status: 422 },
      );
    }
  } else {
    return Response.json(
      { message: "Unknown application type." },
      { status: 422 },
    );
  }

  const created = await createApplication(userId, body);
  return Response.json(created, { status: 201 });
}
