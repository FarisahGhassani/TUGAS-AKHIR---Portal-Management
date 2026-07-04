// Seed data awal.
//
// Sesuai PRD §7.3: admin TIDAK bisa registrasi mandiri; akunnya dibuat secara
// internal lewat seed ini. Password disimpan sebagai hash bcrypt, bukan
// plaintext. Jalankan dengan:
//   npx prisma db seed
//
// Seed dibatasi 3 contoh per data (projects, announcements, inquiries) supaya
// sisanya bisa diuji manual lewat aplikasi. Aman dijalankan berulang
// (idempotent): user/projects pakai upsert by unique; announcements/inquiries
// hanya di-seed saat tabelnya masih kosong.

import {
  PrismaClient,
  Role,
  Gender,
  JenisPendaftaran,
  StatusPendaftaran,
  TipeProject,
  StatusAnnouncement,
  StatusInquiry,
  StatusBatch,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@portalmanagement.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "portal2026";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Administrator";

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { nama: ADMIN_NAME, password: passwordHash, role: Role.admin },
    create: {
      nama: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: Role.admin,
    },
  });
  console.log(`✔ Admin siap: ${admin.email} (id=${admin.idUser})`);
  return admin;
}

async function seedProjects() {
  const projects = [
    {
      slug: "aurora-ss25-campaign",
      judul: "AURORA · SS25 CAMPAIGN",
      event: "PARIS FASHION WEEK",
      tipe: TipeProject.other,
      tglMulai: new Date("2025-03-04"),
      tglSelesai: new Date("2025-03-22"),
      cover:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&h=800&q=80",
      coverAlt:
        "Beauty close-up from the Aurora SS25 campaign under luminous studio light.",
      coverWidth: 1200,
      coverHeight: 800,
      collaborators: [
        { name: "Lena Vossberg", role: "Photographer" },
        { name: "Anya Taylor", role: "Model" },
        { name: "Studio Noir", role: "Styling" },
      ],
    },
    {
      slug: "concrete-bloom-editorial",
      judul: "CONCRETE BLOOM",
      event: "DAZED DIGITAL FEATURE",
      tipe: TipeProject.photoshoot,
      tglMulai: new Date("2025-02-12"),
      tglSelesai: new Date("2025-02-18"),
      cover:
        "https://images.unsplash.com/photo-1496360166961-10a51d5f367a?auto=format&fit=crop&w=1000&h=1250&q=80",
      coverAlt:
        "Editorial portrait against a brutalist concrete wall for the Concrete Bloom story.",
      coverWidth: 1000,
      coverHeight: 1250,
      collaborators: [
        { name: "Sofia Lorenz", role: "Model" },
        { name: "Mateo Ruiz", role: "Photographer" },
        { name: "Iris Halim", role: "Makeup" },
      ],
    },
    {
      slug: "nocturne-runway-show",
      judul: "NOCTURNE",
      event: "JAKARTA FASHION WEEK",
      tipe: TipeProject.event,
      tglMulai: new Date("2025-01-28"),
      tglSelesai: new Date("2025-02-02"),
      cover:
        "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=1280&h=720&q=80",
      coverAlt:
        "Runway moment from the Nocturne show shot in dramatic low light.",
      coverWidth: 1280,
      coverHeight: 720,
      collaborators: [
        { name: "Atelier Noir", role: "Designer" },
        { name: "Julian Vance", role: "Model" },
        { name: "Portal Cast", role: "Casting" },
      ],
    },
  ];

  for (const p of projects) {
    await prisma.projects.upsert({
      where: { slug: p.slug },
      update: { tglMulai: p.tglMulai, tglSelesai: p.tglSelesai },
      create: p,
    });
  }
  console.log(`✔ Projects siap: ${projects.length} contoh`);
}

async function seedAnnouncements() {
  const count = await prisma.announcement.count();
  if (count > 0) {
    console.log(`• Announcements dilewati (sudah ada ${count} baris)`);
    return;
  }
  await prisma.announcement.createMany({
    data: [
      {
        judul: "OPEN CASTING · FALL/WINTER 2026",
        ringkasan:
          "Pencarian wajah baru untuk kampanye fall/winter 2026 dari rumah mode kolaboratif Portal Management. Terbuka untuk talent main board dan development.",
        fotoPoster:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80",
        link: "/auth",
        tanggalBerakhir: new Date("2026-12-15"),
        status: StatusAnnouncement.aktif,
      },
      {
        judul: "BATCH 09 · RUNWAY FUNDAMENTALS",
        ringkasan:
          "Pendaftaran batch ke-9 kelas runway dibuka. Kuota terbatas 20 peserta, dimulai 20 Juli 2026 selama enam minggu di Jakarta dan Bandung.",
        fotoPoster:
          "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=80",
        link: "/auth",
        tanggalBerakhir: new Date("2026-12-10"),
        status: StatusAnnouncement.aktif,
      },
      {
        judul: "PORTAL OPEN HOUSE · STUDIO SEMARANG",
        ringkasan:
          "Kunjungi studio baru Portal Management di Semarang. Sesi tur, ramah-tamah dengan tim casting, dan portfolio review singkat tanpa biaya pendaftaran.",
        fotoPoster:
          "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1400&q=80",
        link: "/auth",
        tanggalBerakhir: new Date("2026-12-25"),
        status: StatusAnnouncement.aktif,
      },
    ],
  });
  console.log("✔ Announcements siap: 3 contoh");
}

// Inquiry contoh dikirim sebagai tamu (idUser null) — client dibuat sendiri
// oleh user nanti lewat registrasi.
async function seedInquiries() {
  const count = await prisma.inquiryClient.count();
  if (count > 0) {
    console.log(`• Inquiries dilewati (sudah ada ${count} baris)`);
    return;
  }
  await prisma.inquiryClient.createMany({
    data: [
      {
        namaClient: "Lukas Beaumont",
        noTelepon: "0812-3456-7890",
        judulProject: "Spring Editorial · Maison Arno",
        brand: "MAISON ARNO",
        jenisJob: "Editorial",
        tanggalProject: new Date("2026-07-18"),
        modelPilihan: "2 talent runway wanita, tinggi 175cm+",
        catatanClient: "Konsep monokrom, lokasi studio Jakarta Selatan.",
        status: StatusInquiry.completed,
        catatanAdmin:
          "Kontrak selesai. Talent Aria & Naya dikonfirmasi untuk sesi 18 Juli.",
      },
      {
        namaClient: "Lukas Beaumont",
        noTelepon: "0812-3456-7890",
        judulProject: "Campaign Resort 25 Lookbook",
        brand: "ATELIER NORD",
        jenisJob: "Campaign",
        tanggalProject: new Date("2026-08-05"),
        modelPilihan: "1 talent pria untuk lookbook resort.",
        catatanClient: "Butuh talent dengan pengalaman kampanye internasional.",
        status: StatusInquiry.in_progress,
        catatanAdmin:
          "Sedang menyiapkan 3 opsi portfolio talent. Akan kami kirim minggu ini.",
      },
      {
        namaClient: "Lukas Beaumont",
        noTelepon: "0812-3456-7890",
        judulProject: "Runway Show · Jakarta Fashion Week",
        jenisJob: "Runway",
        tanggalProject: new Date("2026-09-12"),
        modelPilihan: "5 talent runway (campuran).",
        catatanClient: "Casting awal, jumlah final menyusul.",
        status: StatusInquiry.submitted,
      },
    ],
  });
  console.log("✔ Inquiries siap: 3 contoh");
}

// Talent = pendaftar lolos: tiap talent = baris pendaftaran (jenis=talent,
// status=diterima) + baris talent tertaut. kategori & portfolio disimpan JSON.
async function seedTalents(idUser: number) {
  const count = await prisma.talent.count();
  if (count > 0) {
    console.log(`• Talents dilewati (sudah ada ${count} baris)`);
    return;
  }

  const talents = [
    {
      nama: "ANYA TAYLOR",
      gender: Gender.female,
      tinggi: 178,
      berat: 54,
      baju: "S",
      sepatu: "40",
      instagram: "anyataylorjoy",
      kategori: ["photoshoot", "runway", "muse-beauty"],
      comcard:
        "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?auto=format&fit=crop&w=900&q=80",
      portfolio: [
        {
          id: "anya-1",
          caption: "VOGUE ITALIA",
          image:
            "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1600&q=80",
          alt: "Editorial monokrom Anya Taylor.",
        },
        {
          id: "anya-2",
          caption: "MAISON ARNO",
          image:
            "https://images.unsplash.com/photo-1485875437342-9b39470b3d95?auto=format&fit=crop&w=1200&q=80",
          alt: "Kampanye Anya Taylor dengan siluet arsitektural.",
        },
      ],
    },
    {
      nama: "JULIAN VANCE",
      gender: Gender.male,
      tinggi: 185,
      berat: 75,
      baju: "M",
      sepatu: "44",
      instagram: "davidgandy_official",
      kategori: ["photoshoot", "runway", "commercial"],
      comcard:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
      portfolio: [
        {
          id: "julian-1",
          caption: "L'UOMO VOGUE",
          image:
            "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1600&q=80",
          alt: "Editorial hitam putih Julian Vance.",
        },
      ],
    },
    {
      nama: "SOFIA LORENZ",
      gender: Gender.female,
      tinggi: 180,
      berat: 56,
      baju: "S",
      sepatu: "40",
      instagram: "bellahadid",
      kategori: ["runway", "photoshoot", "tvc"],
      comcard:
        "https://images.unsplash.com/photo-1530785602389-07594beb8b73?auto=format&fit=crop&w=900&q=80",
      portfolio: [
        {
          id: "sofia-1",
          caption: "DAZED",
          image:
            "https://images.unsplash.com/photo-1496360166961-10a51d5f367a?auto=format&fit=crop&w=1600&q=80",
          alt: "Editorial Sofia Lorenz di dinding brutalist.",
        },
      ],
    },
  ];

  for (const t of talents) {
    await prisma.talent.create({
      data: {
        kategori: JSON.stringify(t.kategori),
        fotoComcard: t.comcard,
        fotoPortofolio: JSON.stringify(t.portfolio),
        pendaftaran: {
          create: {
            idUser,
            namaTalent: t.nama,
            gender: t.gender,
            tanggalLahir: new Date("2000-01-01"),
            tinggiBadan: t.tinggi,
            beratBadan: t.berat,
            sizeBaju: t.baju,
            sizeSepatu: t.sepatu,
            noIdentitas: "-",
            noTelepon: "-",
            instagram: t.instagram,
            fotoProfil: t.comcard,
            jenis: JenisPendaftaran.talent,
            status: StatusPendaftaran.accepted,
          },
        },
      },
    });
  }
  console.log(`✔ Talents siap: ${talents.length} contoh (pendaftaran + talent)`);
}

// Backfill akun Instagram untuk talent yang SUDAH ada (kolom instagram baru,
// jadi baris lama bernilai NULL). Idempotent & aman dijalankan berulang: nama
// dikenal diset ke handle artis nyata supaya bisa direct; sisanya (null/kosong)
// diberi fallback agar tombol IG di halaman detail selalu ada.
const IG_BY_NAME: Record<string, string> = {
  "ANYA TAYLOR": "anyataylorjoy",
  "JULIAN VANCE": "davidgandy_official",
  "SOFIA LORENZ": "bellahadid",
};
const IG_FALLBACK = ["gigihadid", "imaanhammam", "jordanbarrett"];

async function backfillTalentInstagram() {
  const rows = await prisma.pendaftaran.findMany({
    where: { jenis: JenisPendaftaran.talent },
    select: { idPendaftaran: true, namaTalent: true, instagram: true },
    orderBy: { idPendaftaran: "asc" },
  });

  let updated = 0;
  let fallbackIdx = 0;
  for (const r of rows) {
    const known = IG_BY_NAME[r.namaTalent.trim().toUpperCase()];
    if (known) {
      if (r.instagram !== known) {
        await prisma.pendaftaran.update({
          where: { idPendaftaran: r.idPendaftaran },
          data: { instagram: known },
        });
        updated++;
      }
      continue;
    }
    if (!r.instagram?.trim()) {
      await prisma.pendaftaran.update({
        where: { idPendaftaran: r.idPendaftaran },
        data: { instagram: IG_FALLBACK[fallbackIdx % IG_FALLBACK.length] },
      });
      fallbackIdx++;
      updated++;
    }
  }
  console.log(`✔ Instagram talent di-backfill: ${updated} baris diperbarui`);
}

// Batch kelas modelling — batchKe urut (1,2,3).
async function seedBatches() {
  const count = await prisma.batchModelling.count();
  if (count > 0) {
    console.log(`• Batches dilewati (sudah ada ${count} baris)`);
    return;
  }
  await prisma.batchModelling.createMany({
    data: [
      // Upcoming → buka.
      {
        namaBatch: "Catwalk Class",
        kuota: 20,
        tglMulai: new Date("2026-07-07"),
        tglBerakhir: new Date("2026-08-15"),
        statusPendaftaran: StatusBatch.buka,
      },
      {
        namaBatch: "Photoshoot Practice",
        kuota: 15,
        tglMulai: new Date("2026-08-25"),
        tglBerakhir: new Date("2026-10-03"),
        statusPendaftaran: StatusBatch.buka,
      },
      // Sudah lewat tanggal selesai → otomatis TUTUP (meski status buka).
      {
        namaBatch: "Posing & Personal Branding",
        kuota: 18,
        tglMulai: new Date("2026-04-06"),
        tglBerakhir: new Date("2026-05-18"),
        statusPendaftaran: StatusBatch.buka,
      },
    ],
  });
  console.log("✔ Batches siap: 3 contoh");
}

// Aset situs default (admin bisa ganti via /admin/assets). update:{} agar
// reseed tidak menimpa perubahan admin.
async function seedSiteAssets() {
  const defaults = [
    { key: "hero_video", value: "/videos/portal-asset.mp4" },
    {
      key: "essence_image",
      value:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      key: "auth_image",
      value:
        "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=80",
    },
  ];
  for (const a of defaults) {
    await prisma.siteSetting.upsert({
      where: { key: a.key },
      update: {},
      create: a,
    });
  }
  console.log(`✔ Site assets siap: ${defaults.length} aset`);
}

async function main() {
  const admin = await seedAdmin();
  await seedTalents(admin.idUser);
  await backfillTalentInstagram();
  await seedProjects();
  await seedAnnouncements();
  await seedBatches();
  await seedInquiries();
  await seedSiteAssets();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
