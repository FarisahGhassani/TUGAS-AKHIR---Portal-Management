import { listAllTalents, createTalent } from "@/server/db/talents";
import type { TalentInput } from "@/store/api/talentApi";

export const dynamic = "force-dynamic";

// Roster lengkap untuk panel admin.
export async function GET() {
  return Response.json(await listAllTalents());
}

// Tambah talent → langsung tampil di sisi publik (MySQL via Prisma).
export async function POST(request: Request) {
  const body = (await request.json()) as TalentInput;
  if (
    !body.name?.trim() ||
    !body.cover?.trim() ||
    !body.heightCm ||
    !body.instagram?.trim()
  ) {
    return Response.json(
      { message: "Nama, foto cover, tinggi badan, dan Instagram wajib diisi." },
      { status: 422 },
    );
  }
  const created = await createTalent(body);
  return Response.json(created, { status: 201 });
}
