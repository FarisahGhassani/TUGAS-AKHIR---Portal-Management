// ---------------------------------------------------------------------------
// Classes — batch_modelling + approval pendaftaran kelas + enrollment, DB-backed.
//
// TIDAK ada kolom "batch ke": nomor batch ("Batch 01") DITURUNKAN dari urutan
// baris (by id_batch) saat dibaca, jadi tetap rapat tanpa lompat meski ada batch
// yang dihapus. Pendaftaran kelas = pendaftaran jenis=kelas (idBatch menunjuk
// batch). Diterima → buat enrollment (talent_batch) → kelulusan + sertifikat.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { judulPublik } from "@/lib/teksPublik";
import { formatShoeSize } from "@/lib/talentFormat";
import type {
  BatchDetail,
  BatchInput,
  BatchStudent,
  ClassRegistration,
  ClassRegistrationStatus,
  GraduationStatus,
  ModellingBatch,
} from "@/store/api/dashboardApi";
import type { TalentGender } from "@/store/api/talentApi";
import type {
  BatchModelling as PrismaBatch,
  Gender as PrismaGender,
  Pendaftaran as PrismaPendaftaran,
  TalentBatch as PrismaTalentBatch,
} from "@prisma/client";

// DB enum (non_binary) → shape app ("non-binary").
function genderFromDb(g: PrismaGender): TalentGender {
  return g === "non_binary" ? "non-binary" : g;
}

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

// Hitungan turunan sebuah batch: murid yang join (talent_batch), berapa yang
// sudah lulus, dan berapa pendaftaran yang masih menunggu keputusan admin.
type BatchCounts = { murid: number; lulus: number; pending: number };
const NO_COUNTS: BatchCounts = { murid: 0, lulus: 0, pending: 0 };

function toBatch(
  row: PrismaBatch,
  batchKe: number,
  counts: BatchCounts = NO_COUNTS,
): ModellingBatch {
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
    muridCount: counts.murid,
    lulusCount: counts.lulus,
    pendingCount: counts.pending,
  };
}

// Hitungan untuk SEMUA batch sekaligus (3 groupBy) — supaya daftar batch tidak
// menembak query per baris.
async function countsByBatch(): Promise<Map<number, BatchCounts>> {
  const [murid, lulus, pending] = await Promise.all([
    prisma.talentBatch.groupBy({ by: ["idBatch"], _count: { _all: true } }),
    prisma.talentBatch.groupBy({
      by: ["idBatch"],
      where: { statusLulus: "lulus" },
      _count: { _all: true },
    }),
    prisma.pendaftaran.groupBy({
      by: ["idBatch"],
      where: {
        jenis: "kelas",
        status: { in: ["submitted", "in_progress"] },
        idBatch: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const out = new Map<number, BatchCounts>();
  const bump = (id: number | null, key: keyof BatchCounts, n: number) => {
    if (id === null) return;
    const current = out.get(id) ?? { murid: 0, lulus: 0, pending: 0 };
    current[key] = n;
    out.set(id, current);
  };
  murid.forEach((r) => bump(r.idBatch, "murid", r._count._all));
  lulus.forEach((r) => bump(r.idBatch, "lulus", r._count._all));
  pending.forEach((r) => bump(r.idBatch, "pending", r._count._all));
  return out;
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
  const [rows, counts] = await Promise.all([
    prisma.batchModelling.findMany({ orderBy: { idBatch: "asc" } }),
    countsByBatch(),
  ]);
  return rows.map((r, i) => toBatch(r, i + 1, counts.get(r.idBatch)));
}

export async function createBatch(input: BatchInput): Promise<ModellingBatch> {
  const row = await prisma.batchModelling.create({
    data: {
      namaBatch: judulPublik(input.namaBatch),
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
      namaBatch: judulPublik(input.namaBatch),
      kuota: input.kuota,
      tglMulai: new Date(input.tglMulai),
      tglBerakhir: new Date(input.tglBerakhir),
      statusPendaftaran: input.statusPendaftaran,
    },
  });
  const counts = await countsByBatch();
  return toBatch(row, await batchKeOf(row.idBatch), counts.get(row.idBatch));
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
    // Biodata submitted (form kelas memakai template yang sama dengan form
    // talent) — dipakai modal review admin sebelum memutuskan.
    gender: genderFromDb(p.gender),
    tanggalLahir: p.tanggalLahir.toISOString().slice(0, 10),
    tinggiBadan: p.tinggiBadan,
    beratBadan: p.beratBadan,
    sizeBaju: p.sizeBaju,
    sizeSepatu: formatShoeSize(p.sizeSepatu),
    noIdentitas: p.noIdentitas,
    noTelepon: p.noTelepon,
    instagram: p.instagram?.trim() || undefined,
    fotoProfil: p.fotoProfil,
    batchId: p.idBatch ? String(p.idBatch) : null,
    batchLabel: batchLabel(pos, p.batch?.namaBatch),
    status: p.status as ClassRegistrationStatus,
    appliedAt: p.createdAt.toISOString().slice(0, 10),
    statusLulus: (p.talentBatch?.statusLulus ?? "belum") as GraduationStatus,
    sertifikatUrl: p.talentBatch?.sertifikatUrl ?? undefined,
  };
}

// Detail satu kelas untuk halaman /admin/classes/[id]: header batch, antrean
// pendaftaran yang belum diputuskan, dan DAFTAR MURID = baris talent_batch
// (satu baris per murid yang benar-benar join batch ini).
export async function getBatchDetail(id: string): Promise<BatchDetail | null> {
  const idBatch = Number(id);
  if (!Number.isInteger(idBatch) || idBatch <= 0) return null;

  const row = await prisma.batchModelling.findUnique({ where: { idBatch } });
  if (!row) return null;

  const [positions, counts, pendingRows, enrollments] = await Promise.all([
    batchPositions(),
    countsByBatch(),
    prisma.pendaftaran.findMany({
      where: {
        idBatch,
        jenis: "kelas",
        status: { in: ["submitted", "in_progress"] },
      },
      orderBy: { createdAt: "desc" },
      include: { batch: true, talentBatch: true },
    }),
    prisma.talentBatch.findMany({
      where: { idBatch },
      orderBy: { idTalentBatch: "asc" },
      include: { pendaftaran: { include: { user: true } } },
    }),
  ]);

  const students: BatchStudent[] = enrollments.map((e) => ({
    id: String(e.idPendaftaran),
    idTalentBatch: String(e.idTalentBatch),
    name: e.pendaftaran.namaTalent,
    email: e.pendaftaran.user.email,
    noTelepon: e.pendaftaran.noTelepon,
    joinedAt: e.createdAt.toISOString().slice(0, 10),
    statusLulus: e.statusLulus as GraduationStatus,
    sertifikatUrl: e.sertifikatUrl ?? undefined,
  }));

  return {
    batch: toBatch(
      row,
      positions.get(idBatch) ?? 0,
      counts.get(idBatch),
    ),
    pending: pendingRows.map((p) => toRegistration(p, positions)),
    students,
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
      // Status pendaftaran mengikuti OTOMATIS sebagai akibat aksi admin (bukan
      // diedit manual): kelulusan ditetapkan (lulus/tidak_lulus) → urusan kelas
      // selesai → "completed"; dikembalikan ke "belum" → kembali "accepted".
      if (patch.statusLulus !== undefined) {
        await prisma.pendaftaran.update({
          where: { idPendaftaran },
          data: {
            status: patch.statusLulus === "belum" ? "accepted" : "completed",
          },
        });
      }
    }
  }

  const positions = await batchPositions();
  const updated = await prisma.pendaftaran.findUnique({
    where: { idPendaftaran },
    include: { batch: true, talentBatch: true },
  });
  return updated ? toRegistration(updated, positions) : null;
}
