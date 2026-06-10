import {
  isAnnouncementExpired,
  type Announcement,
} from "@/store/api/announcementsApi";

export const announcements: Announcement[] = [
  {
    id: "ann-casting-fw26",
    judul: "OPEN CASTING — FALL/WINTER 2026",
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
    judul: "BATCH 09 — RUNWAY FUNDAMENTALS",
    ringkasan:
      "Pendaftaran batch ke-9 kelas runway dibuka. Kuota terbatas 20 peserta, dimulai 1 Juni 2026 selama enam minggu di Jakarta dan Bandung.",
    kategori: "kelas",
    fotoPoster:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=80",
    fotoPosterAlt:
      "Sesi latihan runway di studio bertema noir, mencerminkan suasana kelas batch 09.",
    link: "/auth",
    tanggalBerakhir: "2026-06-10",
    status: "aktif",
  },
  {
    id: "ann-kelas-editorial-intensive",
    judul: "EDITORIAL POSING INTENSIVE",
    ringkasan:
      "Workshop dua hari bersama director kreatif tamu untuk membangun portfolio editorial yang siap pitching ke majalah dan brand.",
    kategori: "kelas",
    fotoPoster:
      "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1400&q=80",
    fotoPosterAlt:
      "Sesi pemotretan editorial intensif dengan komposisi avant-garde.",
    link: "/auth",
    tanggalBerakhir: "2026-05-30",
    status: "aktif",
  },
];

export function listActiveAnnouncements(now: Date = new Date()) {
  // Hanya tampilkan yang berstatus aktif DAN belum lewat deadline —
  // pengumuman akan ter-takedown sendiri setelah tanggalBerakhir terlewat.
  return announcements.filter(
    (a) => a.status === "aktif" && !isAnnouncementExpired(a.tanggalBerakhir, now),
  );
}
