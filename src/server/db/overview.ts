// ---------------------------------------------------------------------------
// Metrik dashboard admin — dihitung LANGSUNG dari MySQL (bukan angka mock):
//   - pendingApplications : pendaftaran yang belum diputuskan (submitted / in_progress)
//   - newInquiries        : inquiry klien yang masih "submitted"
//   - activeTalent        : jumlah talent di katalog
//   - activeClassBatches  : batch (belum di DB → 0 untuk sekarang)
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { AdminMetrics } from "@/store/api/adminApi";

export async function getOverviewMetrics(): Promise<AdminMetrics> {
  const [pendingApplications, newInquiries, activeTalent] = await Promise.all([
    prisma.pendaftaran.count({
      where: { status: { in: ["submitted", "in_progress"] } },
    }),
    prisma.inquiryClient.count({ where: { status: "submitted" } }),
    prisma.talent.count(),
  ]);

  return {
    pendingApplications,
    newInquiries,
    activeTalent,
    // Batch belum dimigrasi ke DB (Classes Tahap 1) → 0 sementara.
    activeClassBatches: 0,
  };
}
