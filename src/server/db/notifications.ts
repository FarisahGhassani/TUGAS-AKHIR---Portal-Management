// ---------------------------------------------------------------------------
// Notifikasi admin — TANPA tabel `notification`. Cukup tarik baris TERBARU dari
// `pendaftaran` + `inquiry_client`, tampilkan judulnya di dashboard admin, dan
// sediakan `href` agar klik mengarah ke submenu terkait. `unread` dihitung
// terhadap `user.notifSeenAt` admin (kolom yang sama dipakai user) → titik merah.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { AdminNotificationItem } from "@/store/api/adminApi";

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type Row = AdminNotificationItem & { sort: number };

export async function listAdminNotifications(
  adminUserId?: number,
): Promise<AdminNotificationItem[]> {
  // notifSeenAt admin → penentu unread. Tanpa userId (mis. dipanggil internal),
  // semuanya dianggap sudah dibaca.
  const admin =
    adminUserId && Number.isInteger(adminUserId)
      ? await prisma.user.findUnique({ where: { idUser: adminUserId } })
      : null;
  const seen = admin?.notifSeenAt ?? null;
  const isUnread = (createdAt: Date) => !seen || createdAt > seen;

  const [pendaftaran, inquiries] = await Promise.all([
    prisma.pendaftaran.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.inquiryClient.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const fromPendaftaran: Row[] = pendaftaran.map((p) => ({
    id: `p-${p.idPendaftaran}`,
    kind: "application",
    title:
      p.jenis === "talent"
        ? `Talent application · ${p.namaTalent}`
        : `Class registration · ${p.namaTalent}`,
    time: fmt.format(p.createdAt),
    href: p.jenis === "talent" ? "/admin/talent" : "/admin/classes",
    unread: isUnread(p.createdAt),
    sort: p.createdAt.getTime(),
  }));

  const fromInquiries: Row[] = inquiries.map((i) => ({
    id: `i-${i.idInquiry}`,
    kind: "inquiry",
    title: `Client inquiry · ${i.namaClient}`,
    time: fmt.format(i.createdAt),
    href: "/admin/clients",
    unread: isUnread(i.createdAt),
    sort: i.createdAt.getTime(),
  }));

  return [...fromPendaftaran, ...fromInquiries]
    .sort((a, b) => b.sort - a.sort)
    .slice(0, 8)
    .map(({ sort: _sort, ...rest }) => {
      void _sort;
      return rest;
    });
}
