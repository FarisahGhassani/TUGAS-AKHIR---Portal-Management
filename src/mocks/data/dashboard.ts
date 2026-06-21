import type {
  DashboardSummary,
  TalentApplication,
  ApplicationType,
  ModellingBatch,
} from "@/store/api/dashboardApi";

export const dashboardSummary: DashboardSummary = {
  greeting: {
    name: "ELARA",
    subtitle:
      "Select the desired submission and track its status",
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

// Batch kelas modelling yang tersedia untuk didaftari (PRD: BATCH_MODELLING).
export const batches: ModellingBatch[] = [
  {
    id: "batch-11",
    namaBatch: "Runway Fundamentals",
    batchKe: 11,
    kuota: 20,
    tglMulai: "2026-08-01",
    tglBerakhir: "2026-09-12",
    statusPendaftaran: "buka",
  },
  {
    id: "batch-12",
    namaBatch: "Editorial Posing Intensive",
    batchKe: 12,
    kuota: 15,
    tglMulai: "2026-09-20",
    tglBerakhir: "2026-10-25",
    statusPendaftaran: "buka",
  },
  {
    id: "batch-13",
    namaBatch: "Commercial Acting Basics",
    batchKe: 13,
    kuota: 18,
    tglMulai: "2026-10-05",
    tglBerakhir: "2026-11-09",
    statusPendaftaran: "tutup",
  },
];

export function listBatches(): ModellingBatch[] {
  return batches;
}

export function findBatch(id: string): ModellingBatch | undefined {
  return batches.find((b) => b.id === id);
}

// Tambah pengajuan baru dari form talent. Status awal "pending", tanggal hari
// ini. Disimpan di depan biar langsung kelihatan paling atas di riwayat.
export function addApplication(input: {
  jenis: ApplicationType;
  judul: string;
}): TalentApplication {
  const application: TalentApplication = {
    id: `ap-${Date.now()}`,
    jenis: input.jenis,
    judul: input.judul,
    tanggal: new Date().toISOString().slice(0, 10),
    status: "pending",
  };
  dashboardSummary.applications.unshift(application);
  return application;
}
