// ---------------------------------------------------------------------------
// Talents — DB-backed (Prisma → MySQL). Talent = pendaftar yang LOLOS:
// biodata (nama, gender, tinggi, ukuran) dibaca dari `pendaftaran`, sedangkan
// kategori + comcard + portfolio dari `talent`. Bentuk yang dikembalikan tetap
// `Talent` (shape RTK) supaya komponen tidak berubah.
//
// `id`  = String(id_talent). `slug` = `${id_talent}-${slugify(nama)}` → URL
// rapi & unik; lookup cukup `parseInt(slug)`. `heightLabel` diturunkan.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { slugify, cmToHeightLabel, formatShoeSize } from "@/mocks/data/talents";
import type {
  Talent,
  TalentApplication,
  TalentApplicationDetail,
  TalentApplicationStatus,
  TalentGender,
  TalentInput,
  TalentListQuery,
  TalentPortfolioItem,
  TalentSummary,
  TalentWorkCategory,
} from "@/store/api/talentApi";
import type {
  Talent as PrismaTalent,
  Pendaftaran as PrismaPendaftaran,
  Gender as PrismaGender,
} from "@prisma/client";

type TalentRow = PrismaTalent & { pendaftaran: PrismaPendaftaran };

// DB enum (non_binary) ↔ shape app ("non-binary").
function genderFromDb(g: PrismaGender): TalentGender {
  return g === "non_binary" ? "non-binary" : g;
}
function genderToDb(g: TalentGender): PrismaGender {
  return g === "non-binary" ? "non_binary" : g;
}

function parseCategories(raw: string): TalentWorkCategory[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as TalentWorkCategory[]) : [];
  } catch {
    return [];
  }
}

function parsePortfolio(raw: string | null): TalentPortfolioItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as TalentPortfolioItem[]) : [];
  } catch {
    return [];
  }
}

// Beri id stabil + alt fallback untuk tiap karya, buang yang tanpa gambar.
function normalizePortfolio(
  base: string,
  items: TalentPortfolioItem[],
): TalentPortfolioItem[] {
  return items
    .filter((p) => p.image?.trim())
    .map((p, i) => ({
      id: p.id || `${base}-${i + 1}`,
      caption: p.caption?.trim() || "UNTITLED",
      image: p.image,
      alt: p.alt?.trim() || p.caption?.trim() || `${base} portfolio ${i + 1}`,
    }));
}

function toTalent(row: TalentRow): Talent {
  const p = row.pendaftaran;
  const slug = `${row.idTalent}-${slugify(p.namaTalent)}`;
  return {
    id: String(row.idTalent),
    slug,
    name: p.namaTalent,
    gender: genderFromDb(p.gender),
    categories: parseCategories(row.kategori),
    heightCm: p.tinggiBadan,
    heightLabel: cmToHeightLabel(p.tinggiBadan),
    cover: row.fotoComcard ?? "",
    coverAlt: p.namaTalent,
    instagram: p.instagram?.trim() ?? "",
    measurements: {
      tinggiBadan: p.tinggiBadan,
      beratBadan: p.beratBadan,
      sizeBaju: p.sizeBaju,
      // EU mentah di DB → "42 EU / 8 UK" (UK dihitung otomatis di sini).
      sizeSepatu: formatShoeSize(p.sizeSepatu),
    },
    portfolio: parsePortfolio(row.fotoPortofolio),
  };
}

function toSummary(t: Talent): TalentSummary {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    gender: t.gender,
    categories: t.categories,
    heightCm: t.heightCm,
    heightLabel: t.heightLabel,
    cover: t.cover,
    coverAlt: t.coverAlt,
  };
}

async function allTalents(): Promise<Talent[]> {
  const rows = await prisma.talent.findMany({
    include: { pendaftaran: true },
    orderBy: { idTalent: "desc" },
  });
  return rows.map(toTalent);
}

export async function listPublicTalents(
  params: TalentListQuery,
): Promise<TalentSummary[]> {
  const talents = await allTalents();
  return talents
    .filter((t) => {
      if (
        params.search &&
        !t.name.toLowerCase().includes(params.search.toLowerCase())
      )
        return false;
      if (params.gender && params.gender !== "all" && t.gender !== params.gender)
        return false;
      if (
        params.category &&
        params.category !== "all" &&
        !t.categories.includes(params.category)
      )
        return false;
      if (params.minHeightCm && t.heightCm < params.minHeightCm) return false;
      return true;
    })
    .map(toSummary);
}

export async function listAllTalents(): Promise<Talent[]> {
  return allTalents();
}

export async function findTalentBySlug(
  slug: string,
): Promise<Talent | undefined> {
  const idTalent = parseInt(slug, 10);
  if (!Number.isInteger(idTalent)) return undefined;
  const row = await prisma.talent.findUnique({
    where: { idTalent },
    include: { pendaftaran: true },
  });
  return row ? toTalent(row) : undefined;
}

// Admin menambah talent langsung. Karena tabel `talent` WAJIB tertaut ke sebuah
// `pendaftaran`, kita buat baris pendaftaran (jenis=talent, status=diterima)
// berisi biodata, lalu baris talent yang menunjuk ke sana. Field registrasi
// yang tidak ada di form admin (tanggal lahir, no identitas/telepon) diisi
// placeholder — tidak ditampilkan ke publik.
export async function createTalent(input: TalentInput): Promise<Talent> {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) throw new Error("Tidak ada akun admin sebagai pemilik pendaftaran.");

  const created = await prisma.talent.create({
    data: {
      kategori: JSON.stringify(input.categories),
      fotoComcard: input.cover,
      fotoPortofolio: JSON.stringify(
        normalizePortfolio(slugify(input.name), input.portfolio),
      ),
      pendaftaran: {
        create: {
          idUser: admin.idUser,
          namaTalent: input.name.trim(),
          gender: genderToDb(input.gender),
          tanggalLahir: new Date("2000-01-01"),
          tinggiBadan: input.heightCm,
          beratBadan: input.measurements.beratBadan,
          sizeBaju: input.measurements.sizeBaju.trim(),
          sizeSepatu: input.measurements.sizeSepatu.trim(),
          noIdentitas: "-",
          noTelepon: "-",
          instagram: input.instagram?.trim() || null,
          fotoProfil: input.cover,
          jenis: "talent",
          status: "accepted",
        },
      },
    },
    include: { pendaftaran: true },
  });
  return toTalent(created);
}

export async function updateTalent(
  slug: string,
  input: TalentInput,
): Promise<Talent | undefined> {
  const idTalent = parseInt(slug, 10);
  if (!Number.isInteger(idTalent)) return undefined;
  const existing = await prisma.talent.findUnique({
    where: { idTalent },
    include: { pendaftaran: true },
  });
  if (!existing) return undefined;

  const updated = await prisma.talent.update({
    where: { idTalent },
    data: {
      kategori: JSON.stringify(input.categories),
      fotoComcard: input.cover,
      fotoPortofolio: JSON.stringify(
        normalizePortfolio(slugify(input.name), input.portfolio),
      ),
      pendaftaran: {
        update: {
          namaTalent: input.name.trim(),
          gender: genderToDb(input.gender),
          tinggiBadan: input.heightCm,
          beratBadan: input.measurements.beratBadan,
          sizeBaju: input.measurements.sizeBaju.trim(),
          sizeSepatu: input.measurements.sizeSepatu.trim(),
          instagram: input.instagram?.trim() || null,
          fotoProfil: input.cover,
        },
      },
    },
    include: { pendaftaran: true },
  });
  return toTalent(updated);
}

export async function deleteTalent(slug: string): Promise<boolean> {
  const idTalent = parseInt(slug, 10);
  if (!Number.isInteger(idTalent)) return false;
  const existing = await prisma.talent.findUnique({ where: { idTalent } });
  if (!existing) return false;
  // Hapus talent dulu (FK RESTRICT), lalu pendaftaran induknya.
  await prisma.talent.delete({ where: { idTalent } });
  await prisma.pendaftaran.delete({
    where: { idPendaftaran: existing.idPendaftaran },
  });
  return true;
}

// --- approval pendaftaran talent ------------------------------------------

function toApplication(
  p: PrismaPendaftaran & { talent: PrismaTalent | null },
): TalentApplication {
  return {
    id: String(p.idPendaftaran),
    name: p.namaTalent,
    gender: genderFromDb(p.gender),
    heightCm: p.tinggiBadan,
    status: p.status as TalentApplicationStatus,
    appliedAt: p.createdAt.toISOString().slice(0, 10),
    inCatalog: Boolean(p.talent),
  };
}

export async function listTalentApplications(): Promise<TalentApplication[]> {
  const rows = await prisma.pendaftaran.findMany({
    where: { jenis: "talent" },
    orderBy: { createdAt: "desc" },
    include: { talent: true },
  });
  return rows.map(toApplication);
}

// Detail lengkap data yang di-submit pelamar (untuk modal review admin).
export async function getTalentApplicationDetail(
  id: string,
): Promise<TalentApplicationDetail | null> {
  const idPendaftaran = parseInt(id, 10);
  if (!Number.isInteger(idPendaftaran)) return null;
  const p = await prisma.pendaftaran.findUnique({
    where: { idPendaftaran },
    include: { talent: true },
  });
  if (!p || p.jenis !== "talent") return null;
  return {
    ...toApplication(p),
    tanggalLahir: p.tanggalLahir.toISOString().slice(0, 10),
    beratBadan: p.beratBadan,
    sizeBaju: p.sizeBaju,
    sizeSepatu: formatShoeSize(p.sizeSepatu),
    noIdentitas: p.noIdentitas,
    noTelepon: p.noTelepon,
    instagram: p.instagram?.trim() || undefined,
    fotoProfil: p.fotoProfil,
    fotoPortofolio: p.fotoPortofolio ?? undefined,
  };
}

// Putuskan pendaftaran: ubah status. accepted → buat baris talent (muncul di
// katalog, comcard = foto profil, kategori/portfolio kosong → dilengkapi admin
// lewat roster). rejected → keluarkan dari katalog bila sempat masuk.
export async function decideTalentApplication(
  id: string,
  status: TalentApplicationStatus,
): Promise<TalentApplication | null> {
  const idPendaftaran = parseInt(id, 10);
  if (!Number.isInteger(idPendaftaran)) return null;
  const existing = await prisma.pendaftaran.findUnique({
    where: { idPendaftaran },
    include: { talent: true },
  });
  if (!existing || existing.jenis !== "talent") return null;

  await prisma.pendaftaran.update({
    where: { idPendaftaran },
    data: { status },
  });

  if (status === "accepted" && !existing.talent) {
    await prisma.talent.create({
      data: {
        idPendaftaran,
        kategori: "[]",
        fotoComcard: existing.fotoProfil,
        fotoPortofolio: "[]",
      },
    });
  }
  if (status === "rejected" && existing.talent) {
    await prisma.talent.delete({
      where: { idTalent: existing.talent.idTalent },
    });
  }

  const updated = await prisma.pendaftaran.findUnique({
    where: { idPendaftaran },
    include: { talent: true },
  });
  return updated ? toApplication(updated) : null;
}
