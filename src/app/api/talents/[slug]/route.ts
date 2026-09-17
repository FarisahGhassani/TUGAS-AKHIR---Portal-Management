import { getTalent } from "@/server/db/talents";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const talent = await getTalent(slug);
  if (!talent) {
    return Response.json({ message: "Talent not found." }, { status: 404 });
  }
  return Response.json(talent);
}
