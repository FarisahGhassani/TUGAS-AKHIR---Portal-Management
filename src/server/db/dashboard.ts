// ---------------------------------------------------------------------------
// Dashboard talent — DB-backed & PER-USER (Prisma → MySQL).
//
// Riwayat apply = baris `pendaftaran` milik user; kelas = `talent_batch` dari
// talent milik user. Akun baru belum punya keduanya → kosong (ini memperbaiki
// bug dashboard mock yang menampilkan riwayat ELARA untuk semua orang).
//
// Pendaftaran ditulis dengan status awal `submitted`. Form talent & kelas kini
// memakai template biodata yang sama (kelas tanpa portofolio), jadi kedua jenis
// menulis data sungguhan ke kolom pendaftaran yang sama.
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

// Portofolio disimpan sebagai LINK. Pengguna sering menempel "drive.google.com/…"
// tanpa skema — dilengkapi https:// supaya tautannya bisa langsung dibuka admin.
// Kosong → null (kolom opsional).
function normalizePortfolioLink(raw?: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.slice(0, 500);
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

  // Kelas yang diikuti = pendaftaran kelas user yang DITERIMA atau sudah
  // SELESAI (completed — otomatis setelah kelulusan ditetapkan), + batch-nya.
  const kelas = await prisma.pendaftaran.findMany({
    where: {
      idUser: userId,
      jenis: "kelas",
      status: { in: ["accepted", "completed"] },
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
        portofolioUrl: normalizePortfolioLink(input.portofolioUrl),
        jenis: "talent",
        status: "submitted",
      },
    });
    return toApplication(created);
  }

  // jenis === "kelas". idBatch menunjuk batch terpilih (DB). Form kelas kini
  // memakai template biodata yang SAMA dengan form talent (tanpa portofolio),
  // jadi seluruh kolom pendaftaran terisi data sungguhan — tanpa placeholder.
  const idBatch = Number(input.batchId);
  const created = await prisma.pendaftaran.create({
    data: {
      idUser: userId,
      idBatch: Number.isInteger(idBatch) && idBatch > 0 ? idBatch : null,
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
      jenis: "kelas",
      status: "submitted",
    },
  });
  return toApplication(created);
}
