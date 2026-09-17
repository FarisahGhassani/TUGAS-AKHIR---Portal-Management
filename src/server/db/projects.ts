// ---------------------------------------------------------------------------
// Projects — DB-backed (Prisma → MySQL `projects`).
//
// Menggantikan store in-memory `src/server/store.ts` untuk projects. Bentuk yang
// dikembalikan TETAP `Project` (shape RTK), jadi route handler & komponen tidak
// perlu berubah. `id`, `slug`, dan `dateLabel` diturunkan server.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { judulPublik } from "@/lib/teksPublik";
import { slugify } from "@/lib/talentFormat";
import type {
  Project,
  ProjectCollaborator,
  ProjectInput,
  ProjectListQuery,
} from "@/store/api/projectsApi";
import type { Projects as PrismaProject } from "@prisma/client";

const dateLabelFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

// Date (kolom @db.Date) → "yyyy-mm-dd" untuk dipakai sebagai sumber pengurutan.
function toISODate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

function fmt(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : dateLabelFmt.format(d);
}

// Bangun label timeline: mulai–selesai. Tanpa selesai → "… – Present".
// Bulan-tahun sama → cukup satu label.
function toTimelineLabel(start: string, end: string): string {
  if (!start) return "";
  const s = fmt(start);
  if (!end) return `${s} – Present`;
  const e = fmt(end);
  return s === e ? s : `${s} – ${e}`;
}

function toProject(row: PrismaProject): Project {
  const date = toISODate(row.tglMulai);
  const endDate = toISODate(row.tglSelesai);
  return {
    id: String(row.idProjects),
    slug: row.slug,
    title: row.judul,
    event: row.event,
    type: row.tipe,
    date,
    endDate: endDate || undefined,
    dateLabel: toTimelineLabel(date, endDate),
    cover: row.cover ?? "",
    coverAlt: row.coverAlt ?? row.judul,
    coverWidth: row.coverWidth ?? 1200,
    coverHeight: row.coverHeight ?? 800,
    collaborators: (row.collaborators as ProjectCollaborator[] | null) ?? [],
  };
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || `project-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (await prisma.projects.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export async function listPublicProjects(
  params: ProjectListQuery,
): Promise<Project[]> {
  const rows = await prisma.projects.findMany({
    orderBy: { tglMulai: "desc" },
  });
  return rows.map(toProject).filter((p) => {
    if (
      params.search &&
      !`${p.title} ${p.event}`
        .toLowerCase()
        .includes(params.search.toLowerCase())
    )
      return false;
    if (params.type && params.type !== "all" && p.type !== params.type)
      return false;
    return true;
  });
}

export async function listAllProjects(): Promise<Project[]> {
  const rows = await prisma.projects.findMany({
    orderBy: { tglMulai: "desc" },
  });
  return rows.map(toProject);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const slug = await uniqueSlug(slugify(input.title));
  const row = await prisma.projects.create({
    data: {
      slug,
      judul: judulPublik(input.title),
      event: judulPublik(input.event),
      tipe: input.type,
      tglMulai: input.date ? new Date(input.date) : null,
      tglSelesai: input.endDate ? new Date(input.endDate) : null,
      cover: input.cover,
      coverAlt: input.coverAlt?.trim() || input.title.trim(),
      coverWidth: input.coverWidth || 1200,
      coverHeight: input.coverHeight || 800,
      collaborators: input.collaborators.filter((c) => c.name.trim()),
    },
  });
  return toProject(row);
}

// Slug tidak diubah meski judul berganti supaya tautan tetap stabil.
export async function updateProject(
  slug: string,
  input: ProjectInput,
): Promise<Project | undefined> {
  const existing = await prisma.projects.findUnique({ where: { slug } });
  if (!existing) return undefined;
  const row = await prisma.projects.update({
    where: { slug },
    data: {
      judul: judulPublik(input.title),
      event: judulPublik(input.event),
      tipe: input.type,
      tglMulai: input.date ? new Date(input.date) : null,
      tglSelesai: input.endDate ? new Date(input.endDate) : null,
      cover: input.cover,
      coverAlt: input.coverAlt?.trim() || input.title.trim(),
      coverWidth: input.coverWidth || existing.coverWidth || 1200,
      coverHeight: input.coverHeight || existing.coverHeight || 800,
      collaborators: input.collaborators.filter((c) => c.name.trim()),
    },
  });
  return toProject(row);
}

export async function deleteProject(slug: string): Promise<boolean> {
  const existing = await prisma.projects.findUnique({ where: { slug } });
  if (!existing) return false;
  await prisma.projects.delete({ where: { slug } });
  return true;
}
