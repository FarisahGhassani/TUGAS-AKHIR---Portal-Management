import { updateTalent, deleteTalent } from "@/server/db/talents";
import type { TalentInput } from "@/store/api/talentApi";

export const dynamic = "force-dynamic";

// Edit talent.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
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
  const updated = await updateTalent(slug, body);
  if (!updated) {
    return Response.json({ message: "Talent tidak ditemukan." }, { status: 404 });
  }
  return Response.json(updated);
}

// Hapus talent dari katalog.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const ok = await deleteTalent(slug);
  if (!ok) {
    return Response.json({ message: "Talent tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ slug });
}
