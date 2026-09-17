// ---------------------------------------------------------------------------
// Metrik dashboard admin — dihitung LANGSUNG dari MySQL (bukan angka mock):
//   - pendingApplications : pendaftaran yang belum diputuskan (submitted / in_progress)
//   - newInquiries        : inquiry klien yang masih "submitted"
//   - activeTalent        : jumlah talent di katalog
//   - activeClassBatches  : batch yang pendaftarannya masih terbuka
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { AdminMetrics } from "@/store/api/adminApi";

// Awal hari ini (UTC) — kolom tgl_berakhir bertipe DATE, jadi Prisma memulangkan
// tengah malam UTC. Batch yang berakhir HARI INI masih dihitung aktif.
function startOfToday(): Date {
  const d = new Date();
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
  );
}

export async function getDashboardMetrics(): Promise<AdminMetrics> {
  const [pendingApplications, newInquiries, activeTalent, activeClassBatches] =
    await Promise.all([
      prisma.pendaftaran.count({
        where: { status: { in: ["submitted", "in_progress"] } },
      }),
      prisma.inquiryClient.count({ where: { status: "submitted" } }),
      prisma.talent.count(),
      // "Aktif" mengikuti aturan yang sama seperti daftar batch: dianggap TUTUP
      // bila admin menutupnya ATAU tanggal berakhirnya sudah lewat.
      prisma.batchModelling.count({
        where: {
          statusPendaftaran: "buka",
          tglBerakhir: { gte: startOfToday() },
        },
      }),
    ]);

  return {
    pendingApplications,
    newInquiries,
    activeTalent,
    activeClassBatches,
  };
}
