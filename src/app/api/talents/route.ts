import { listPublicTalents } from "@/server/db/talents";
import type { TalentGender, TalentWorkCategory } from "@/store/api/talentApi";

// Dibaca daftar talent publik & filter — dari MySQL via Prisma.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const data = await listPublicTalents({
    search: url.searchParams.get("search") ?? undefined,
    gender: (url.searchParams.get("gender") as TalentGender | "all") ?? undefined,
    category:
      (url.searchParams.get("category") as TalentWorkCategory | "all") ??
      undefined,
    minHeightCm: url.searchParams.get("minHeightCm")
      ? Number(url.searchParams.get("minHeightCm"))
      : undefined,
  });
  return Response.json(data);
}
