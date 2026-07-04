import { listPublicProjects } from "@/server/db/projects";
import type { ProjectType } from "@/store/api/projectsApi";

// Dibaca halaman publik /projects — dari MySQL via Prisma.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const data = await listPublicProjects({
    search: url.searchParams.get("search") ?? undefined,
    type: (url.searchParams.get("type") as ProjectType | "all") ?? undefined,
  });
  return Response.json(data);
}
