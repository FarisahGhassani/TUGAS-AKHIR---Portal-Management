// ---------------------------------------------------------------------------
// Dashboard talent — DB-backed & PER-USER (Prisma → MySQL).
//
// Riwayat apply = baris `pendaftaran` milik user; kelas = `talent_batch` dari
// talent milik user. Akun baru belum punya keduanya → kosong (ini memperbaiki
// bug dashboard mock yang menampilkan riwayat ELARA untuk semua orang).
//
// Pendaftaran ditulis dengan status awal `pending`. Catatan: batch belum di DB,
// jadi pendaftaran kelas memakai idBatch null + biodata placeholder untuk kolom
// yang tidak diisi form kelas (NOT NULL di tabel pendaftaran).
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { batchPositions } from "./batches";
import type {
  CreateApplicationRequest,
  DashboardSummary,
  TalentApplication,
  TalentClass,
} from "@/store/api/dashboardApi";
import type { TalentGender } from "@/store/api/talentApi";
import type {
  Pendaftaran as PrismaPendaftaran,
  Gender as PrismaGender,
} from "@prisma/client";

function genderToDb(g: TalentGender): PrismaGender {
  return g === "non-binary" ? "non_binary" : g;
}

function toApplication(p: PrismaPendaftaran): TalentApplication {
  return {
    id: String(p.idPendaftaran),
    jenis: p.jenis,
    judul: p.jenis === "talent" ? "TALENT APPLICATION" : "MODELLING CLASS",
    tanggal: p.createdAt.toISOString().slice(0, 10),
    status: p.status,
  };
}

export async function getDashboard(userId: number): Promise<DashboardSummary> {
  const user = await prisma.user.findUnique({ where: { idUser: userId } });

  const pendaftaran = await prisma.pendaftaran.findMany({
    where: { idUser: userId },
    orderBy: { createdAt: "desc" },
  });

  // Kelas yang diikuti = pendaftaran kelas user yang DITERIMA (+ batch-nya).
  // Kelulusan & sertifikat dibaca dari pendaftaran (diisi admin di Tahap 2).
  const kelas = await prisma.pendaftaran.findMany({
    where: {
      idUser: userId,
      jenis: "kelas",
      status: "accepted",
      idBatch: { not: null },
    },
    include: { batch: true, talentBatch: true },
    orderBy: { createdAt: "desc" },
  });
  const positions = await batchPositions();
  const classes: TalentClass[] = kelas
    .filter((p) => p.batch)
    .map((p) => ({
      id: String(p.idPendaftaran),
      namaBatch: p.batch!.namaBatch,
      batchKe: positions.get(p.batch!.idBatch) ?? 0,
      tglMulai: p.batch!.tglMulai.toISOString().slice(0, 10),
      tglBerakhir: p.batch!.tglBerakhir.toISOString().slice(0, 10),
      statusKelulusan: p.talentBatch?.statusLulus ?? "belum",
      sertifikatUrl: p.talentBatch?.sertifikatUrl ?? undefined,
    }));

  return {
    greeting: {
      name: user?.nama ?? "",
      subtitle: "Select the desired submission and track its status",
    },
    applications: pendaftaran.map(toApplication),
    classes,
  };
}

export async function createApplication(
  userId: number,
  input: CreateApplicationRequest,
): Promise<TalentApplication> {
  if (input.jenis === "talent") {
    const created = await prisma.pendaftaran.create({
      data: {
        idUser: userId,
        namaTalent: input.namaTalent.trim(),
        gender: genderToDb(input.gender),
        tanggalLahir: new Date(input.tanggalLahir),
        tinggiBadan: input.tinggiBadan,
        beratBadan: input.beratBadan,
        sizeBaju: input.sizeBaju.trim(),
        sizeSepatu: input.sizeSepatu.trim(),
        noIdentitas: input.kartuIdentitas.trim(),
        noTelepon: input.noTelepon.trim(),
        instagram: input.instagram?.trim() || null,
        fotoProfil: input.fotoProfil,
        fotoPortofolio: input.fotoPortofolio || null,
        jenis: "talent",
        status: "submitted",
      },
    });
    return toApplication(created);
  }

  // jenis === "kelas". idBatch menunjuk batch terpilih (DB). Biodata yang tak
  // diisi form kelas diberi placeholder (kolom NOT NULL).
  const idBatch = Number(input.batchId);
  const created = await prisma.pendaftaran.create({
    data: {
      idUser: userId,
      idBatch: Number.isInteger(idBatch) && idBatch > 0 ? idBatch : null,
      namaTalent: input.namaTalent.trim(),
      tanggalLahir: new Date("2000-01-01"),
      tinggiBadan: 0,
      beratBadan: 0,
      sizeBaju: "-",
      sizeSepatu: "-",
      noIdentitas: "-",
      noTelepon: input.noTelepon.trim(),
      fotoProfil: "-",
      jenis: "kelas",
      status: "submitted",
    },
  });
  return toApplication(created);
}
