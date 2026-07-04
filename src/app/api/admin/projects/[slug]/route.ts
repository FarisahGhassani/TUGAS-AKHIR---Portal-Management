import { updateProject, deleteProject } from "@/server/db/projects";
import type { ProjectInput } from "@/store/api/projectsApi";

export const dynamic = "force-dynamic";

// Edit project.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await request.json()) as ProjectInput;
  if (!body.title?.trim() || !body.event?.trim() || !body.cover?.trim() || !body.date) {
    return Response.json(
      { message: "Judul, event, tanggal, dan cover wajib diisi." },
      { status: 422 },
    );
  }
  const updated = await updateProject(slug, body);
  if (!updated) {
    return Response.json({ message: "Project tidak ditemukan." }, { status: 404 });
  }
  return Response.json(updated);
}

// Hapus project dari katalog publik.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const ok = await deleteProject(slug);
  if (!ok) {
    return Response.json({ message: "Project tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ slug });
}
