// ---------------------------------------------------------------------------
// Announcements — DB-backed (Prisma → MySQL `announcement`).
//
// Menggantikan store in-memory untuk pengumuman. Bentuk yang dikembalikan TETAP
// `Announcement` (shape RTK). Pengumuman aktif & belum lewat tenggat dibaca
// landing page; admin membaca semuanya.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import {
  isAnnouncementExpired,
  type Announcement,
  type AnnouncementInput,
} from "@/store/api/announcementsApi";
import type { Announcement as PrismaAnnouncement } from "@prisma/client";

function toISODate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

function toAnnouncement(row: PrismaAnnouncement): Announcement {
  return {
    id: String(row.idAnnouncement),
    judul: row.judul,
    ringkasan: row.ringkasan,
    fotoPoster: row.fotoPoster ?? "",
    link: row.link ?? "/auth",
    tanggalBerakhir: toISODate(row.tanggalBerakhir),
    status: row.status,
  };
}

export async function listAllAnnouncements(): Promise<Announcement[]> {
  const rows = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toAnnouncement);
}

export async function listActiveAnnouncements(): Promise<Announcement[]> {
  const rows = await prisma.announcement.findMany({
    where: { status: "aktif" },
    orderBy: { createdAt: "desc" },
  });
  return rows
    .map(toAnnouncement)
    .filter((a) => !isAnnouncementExpired(a.tanggalBerakhir));
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<Announcement> {
  const row = await prisma.announcement.create({
    data: {
      judul: input.judul.trim(),
      ringkasan: input.ringkasan.trim(),
      fotoPoster: input.fotoPoster,
      link: input.link?.trim() || "/auth",
      tanggalBerakhir: input.tanggalBerakhir
        ? new Date(input.tanggalBerakhir)
        : null,
      status: input.status ?? "aktif",
    },
  });
  return toAnnouncement(row);
}

export async function updateAnnouncement(
  id: string,
  patch: Partial<AnnouncementInput>,
): Promise<Announcement | null> {
  const idAnnouncement = Number(id);
  if (!Number.isInteger(idAnnouncement)) return null;
  const existing = await prisma.announcement.findUnique({
    where: { idAnnouncement },
  });
  if (!existing) return null;
  const row = await prisma.announcement.update({
    where: { idAnnouncement },
    data: {
      ...(patch.judul !== undefined ? { judul: patch.judul.trim() } : {}),
      ...(patch.ringkasan !== undefined
        ? { ringkasan: patch.ringkasan.trim() }
        : {}),
      ...(patch.fotoPoster !== undefined
        ? { fotoPoster: patch.fotoPoster }
        : {}),
      ...(patch.link !== undefined ? { link: patch.link.trim() || "/auth" } : {}),
      ...(patch.tanggalBerakhir !== undefined
        ? {
            tanggalBerakhir: patch.tanggalBerakhir
              ? new Date(patch.tanggalBerakhir)
              : null,
          }
        : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    },
  });
  return toAnnouncement(row);
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const idAnnouncement = Number(id);
  if (!Number.isInteger(idAnnouncement)) return false;
  const existing = await prisma.announcement.findUnique({
    where: { idAnnouncement },
  });
  if (!existing) return false;
  await prisma.announcement.delete({ where: { idAnnouncement } });
  return true;
}
