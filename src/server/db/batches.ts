// ---------------------------------------------------------------------------
// Classes — batch_modelling + approval pendaftaran kelas + enrollment, DB-backed.
//
// TIDAK ada kolom "batch ke": nomor batch ("Batch 01") DITURUNKAN dari urutan
// baris (by id_batch) saat dibaca, jadi tetap rapat tanpa lompat meski ada batch
// yang dihapus. Pendaftaran kelas = pendaftaran jenis=kelas (idBatch menunjuk
// batch). Diterima → buat enrollment (talent_batch) → kelulusan + sertifikat.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type {
  BatchInput,
  ClassRegistration,
  ClassRegistrationStatus,
  GraduationStatus,
  ModellingBatch,
} from "@/store/api/dashboardApi";
import type {
  BatchModelling as PrismaBatch,
  Pendaftaran as PrismaPendaftaran,
  TalentBatch as PrismaTalentBatch,
} from "@prisma/client";

function toISODate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

// Tanggal hari ini (lokal) sebagai "yyyy-mm-dd" untuk perbandingan tanggal saja.
function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function toBatch(row: PrismaBatch, batchKe: number): ModellingBatch {
  const tglBerakhir = toISODate(row.tglBerakhir);
  // Otomatis TUTUP bila admin menutup ATAU tanggal selesai sudah lewat.
  const closed =
    row.statusPendaftaran === "tutup" ||
    (tglBerakhir !== "" && tglBerakhir < todayISO());
  return {
    id: String(row.idBatch),
    batchKe,
    namaBatch: row.namaBatch,
    kuota: row.kuota,
    tglMulai: toISODate(row.tglMulai),
    tglBerakhir,
    statusPendaftaran: closed ? "tutup" : "buka",
  };
}

// Peta idBatch → nomor batch (1-based) berdasarkan urutan id (gap-free).
export async function batchPositions(): Promise<Map<number, number>> {
  const rows = await prisma.batchModelling.findMany({
    orderBy: { idBatch: "asc" },
    select: { idBatch: true },
  });
  return new Map(rows.map((r, i) => [r.idBatch, i + 1]));
}

// Nomor batch satu baris = jumlah batch dengan id ≤ id-nya (rank by id order).
async function batchKeOf(idBatch: number): Promise<number> {
  return prisma.batchModelling.count({ where: { idBatch: { lte: idBatch } } });
}

export async function listBatches(): Promise<ModellingBatch[]> {
  const rows = await prisma.batchModelling.findMany({
    orderBy: { idBatch: "asc" },
  });
  return rows.map((r, i) => toBatch(r, i + 1));
}

export async function createBatch(input: BatchInput): Promise<ModellingBatch> {
  const row = await prisma.batchModelling.create({
    data: {
      namaBatch: input.namaBatch.trim(),
      kuota: input.kuota,
      tglMulai: new Date(input.tglMulai),
      tglBerakhir: new Date(input.tglBerakhir),
      statusPendaftaran: input.statusPendaftaran,
    },
  });
  return toBatch(row, await batchKeOf(row.idBatch));
}

export async function updateBatch(
  id: string,
  input: BatchInput,
): Promise<ModellingBatch | null> {
  const idBatch = Number(id);
  if (!Number.isInteger(idBatch)) return null;
  const existing = await prisma.batchModelling.findUnique({ where: { idBatch } });
  if (!existing) return null;
  const row = await prisma.batchModelling.update({
    where: { idBatch },
    data: {
      namaBatch: input.namaBatch.trim(),
      kuota: input.kuota,
      tglMulai: new Date(input.tglMulai),
      tglBerakhir: new Date(input.tglBerakhir),
      statusPendaftaran: input.statusPendaftaran,
    },
  });
  return toBatch(row, await batchKeOf(row.idBatch));
}

// --- pendaftaran kelas (approval + enrollment) ----------------------------

function batchLabel(
  batchKe: number | undefined,
  namaBatch: string | undefined,
): string {
  return batchKe && namaBatch
    ? `Batch ${String(batchKe).padStart(2, "0")} · ${namaBatch}`
    : "—";
}

type RegRow = PrismaPendaftaran & {
  batch: PrismaBatch | null;
  talentBatch: PrismaTalentBatch | null;
};

function toRegistration(
  p: RegRow,
  positions: Map<number, number>,
): ClassRegistration {
  const pos = p.batch ? positions.get(p.batch.idBatch) : undefined;
  return {
    id: String(p.idPendaftaran),
    name: p.namaTalent,
    noTelepon: p.noTelepon,
    batchId: p.idBatch ? String(p.idBatch) : null,
    batchLabel: batchLabel(pos, p.batch?.namaBatch),
    status: p.status as ClassRegistrationStatus,
    appliedAt: p.createdAt.toISOString().slice(0, 10),
    statusLulus: (p.talentBatch?.statusLulus ?? "belum") as GraduationStatus,
    sertifikatUrl: p.talentBatch?.sertifikatUrl ?? undefined,
  };
}

export async function listClassRegistrations(): Promise<ClassRegistration[]> {
  const positions = await batchPositions();
  const rows = await prisma.pendaftaran.findMany({
    where: { jenis: "kelas" },
    orderBy: { createdAt: "desc" },
    include: { batch: true, talentBatch: true },
  });
  return rows.map((p) => toRegistration(p, positions));
}

export async function updateClassRegistration(
  id: string,
  patch: {
    status?: ClassRegistrationStatus;
    statusLulus?: GraduationStatus;
    sertifikatUrl?: string;
  },
): Promise<ClassRegistration | null> {
  const idPendaftaran = parseInt(id, 10);
  if (!Number.isInteger(idPendaftaran)) return null;
  const existing = await prisma.pendaftaran.findUnique({
    where: { idPendaftaran },
    include: { talentBatch: true },
  });
  if (!existing || existing.jenis !== "kelas") return null;

  if (patch.status !== undefined) {
    await prisma.pendaftaran.update({
      where: { idPendaftaran },
      data: { status: patch.status },
    });
    if (
      patch.status === "accepted" &&
      !existing.talentBatch &&
      existing.idBatch
    ) {
      await prisma.talentBatch.create({
        data: { idPendaftaran, idBatch: existing.idBatch },
      });
    }
    if (patch.status === "rejected" && existing.talentBatch) {
      await prisma.talentBatch.delete({ where: { idPendaftaran } });
    }
  }

  if (patch.statusLulus !== undefined || patch.sertifikatUrl !== undefined) {
    const enrolled = await prisma.talentBatch.findUnique({
      where: { idPendaftaran },
    });
    if (enrolled) {
      await prisma.talentBatch.update({
        where: { idPendaftaran },
        data: {
          ...(patch.statusLulus !== undefined
            ? { statusLulus: patch.statusLulus }
            : {}),
          ...(patch.sertifikatUrl !== undefined
            ? { sertifikatUrl: patch.sertifikatUrl }
            : {}),
        },
      });
    }
  }

  const positions = await batchPositions();
  const updated = await prisma.pendaftaran.findUnique({
    where: { idPendaftaran },
    include: { batch: true, talentBatch: true },
  });
  return updated ? toRegistration(updated, positions) : null;
}
