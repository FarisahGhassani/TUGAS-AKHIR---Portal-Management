// ---------------------------------------------------------------------------
// Notifikasi admin — TANPA tabel `notification`. Cukup tarik baris TERBARU dari
// `pendaftaran` + `inquiry_client`, tampilkan judulnya saja di dashboard admin,
// dan sediakan `href` agar klik mengarah ke submenu terkait.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { AdminNotificationItem } from "@/store/api/adminApi";

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type Row = AdminNotificationItem & { sort: number };

export async function listAdminNotifications(): Promise<
  AdminNotificationItem[]
> {
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
    sort: p.createdAt.getTime(),
  }));

  const fromInquiries: Row[] = inquiries.map((i) => ({
    id: `i-${i.idInquiry}`,
    kind: "inquiry",
    title: `Client inquiry · ${i.namaClient}`,
    time: fmt.format(i.createdAt),
    href: "/admin/clients",
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
