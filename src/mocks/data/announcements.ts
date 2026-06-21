import type { Announcement } from "@/store/api/announcementsApi";

// Seed pengumuman. Sumber kebenaran runtime-nya ada di server/store.ts
// (di-clone saat boot) supaya CRUD admin persist lintas reload & tab — sama
// seperti akun/overview. Modul ini hanya menyediakan data awalnya.
export const seedAnnouncements: Announcement[] = [
  {
    id: "ann-casting-fw26",
    judul: "OPEN CASTING · FALL/WINTER 2026",
    ringkasan:
      "Pencarian wajah baru untuk kampanye fall/winter 2026 dari rumah mode kolaboratif Portal Management. Terbuka untuk talent main board dan development.",
    kategori: "casting",
    fotoPoster:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80",
    fotoPosterAlt:
      "Editorial monokromatik untuk casting Fall/Winter 2026 Portal Management.",
    link: "/auth",
    tanggalBerakhir: "2026-06-15",
    status: "aktif",
  },
  {
    id: "ann-kelas-batch-09",
    judul: "BATCH 09 · RUNWAY FUNDAMENTALS",
    ringkasan:
      "Pendaftaran batch ke-9 kelas runway dibuka. Kuota terbatas 20 peserta, dimulai 20 Juli 2026 selama enam minggu di Jakarta dan Bandung.",
    kategori: "kelas",
    fotoPoster:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=80",
    fotoPosterAlt:
      "Sesi latihan runway di studio bertema noir, mencerminkan suasana kelas batch 09.",
    link: "/auth",
    tanggalBerakhir: "2026-07-10",
    status: "aktif",
  },
  {
    id: "ann-umum-open-house",
    judul: "PORTAL OPEN HOUSE · STUDIO SEMARANG",
    ringkasan:
      "Kunjungi studio baru Portal Management di Semarang. Sesi tur, ramah-tamah dengan tim casting, dan portfolio review singkat tanpa biaya pendaftaran.",
    kategori: "umum",
    fotoPoster:
      "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1400&q=80",
    fotoPosterAlt:
      "Suasana open house studio editorial Portal Management dengan nuansa monokrom.",
    link: "/auth",
    tanggalBerakhir: "2026-06-25",
    status: "aktif",
  },
];
