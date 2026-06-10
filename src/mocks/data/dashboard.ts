import type { DashboardSummary } from "@/store/api/dashboardApi";

export const dashboardSummary: DashboardSummary = {
  greeting: {
    name: "ELARA",
    subtitle:
      "Your personal talent space — track every application and modelling class in one place.",
  },
  applications: [
    {
      id: "ap-talent-01",
      jenis: "talent",
      judul: "TALENT APPLICATION",
      tanggal: "2026-02-12",
      status: "diterima",
    },
    {
      id: "ap-kelas-09",
      jenis: "kelas",
      judul: "KELAS BATCH 09 — RUNWAY FUNDAMENTALS",
      tanggal: "2026-04-03",
      status: "diterima",
    },
    {
      id: "ap-kelas-10",
      jenis: "kelas",
      judul: "KELAS BATCH 10 — EDITORIAL POSING INTENSIVE",
      tanggal: "2026-05-20",
      status: "pending",
    },
  ],
  classes: [
    {
      id: "tb-09",
      namaBatch: "RUNWAY FUNDAMENTALS",
      batchKe: 9,
      tglMulai: "2026-06-01",
      tglBerakhir: "2026-07-13",
      statusPembayaran: "valid",
      statusKelulusan: "lulus",
      sertifikatUrl: "/uploads/sertifikat-elara-batch09.pdf",
    },
    {
      id: "tb-10",
      namaBatch: "EDITORIAL POSING INTENSIVE",
      batchKe: 10,
      tglMulai: "2026-07-20",
      tglBerakhir: "2026-07-21",
      statusPembayaran: "pending",
      statusKelulusan: "belum",
    },
  ],
};
