import { listAllProjects, createProject } from "@/server/db/projects";
import type { ProjectInput } from "@/store/api/projectsApi";

export const dynamic = "force-dynamic";

// Daftar lengkap project untuk panel admin.
export async function GET() {
  return Response.json(await listAllProjects());
}

// Tambah project → langsung tampil di halaman publik /projects.
export async function POST(request: Request) {
  const body = (await request.json()) as ProjectInput;
  if (!body.title?.trim() || !body.event?.trim() || !body.cover?.trim() || !body.date) {
    return Response.json(
      { message: "Judul, event, tanggal, dan cover wajib diisi." },
      { status: 422 },
    );
  }
  const created = await createProject(body);
  return Response.json(created, { status: 201 });
}
