// ---------------------------------------------------------------------------
// Notifikasi USER (push ringan) — DB-backed, TANPA tabel Notification.
//
// Feed diturunkan dari perubahan status milik user sendiri:
//   - pendaftaran (talent/kelas) yang statusnya BUKAN "submitted"
//   - inquiry_client yang statusnya BUKAN "submitted"
// "submitted" = aksi user sendiri saat mengirim, jadi bukan notifikasi.
//
// Status "unread" dibandingkan dengan `user.notifSeenAt`. Membuka bel memanggil
// markUserNotificationsRead → set notifSeenAt = now(), sehingga badge hilang.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type {
  UserNotification,
  UserNotificationsResponse,
} from "@/store/api/notificationsApi";

const EMPTY: UserNotificationsResponse = { items: [], unreadCount: 0 };

// submitted → "SUBMITTED", in_progress → "IN PROGRESS", dst.
function labelStatus(status: string): string {
  return status.replace(/_/g, " ").toUpperCase();
}

export async function listUserNotifications(
  userId: number,
): Promise<UserNotificationsResponse> {
  const user = await prisma.user.findUnique({ where: { idUser: userId } });
  if (!user) return EMPTY;
  const seen = user.notifSeenAt;
  const isUnread = (updatedAt: Date) => !seen || updatedAt > seen;

  const [pendaftaran, inquiries] = await Promise.all([
    prisma.pendaftaran.findMany({
      where: { idUser: userId, status: { not: "submitted" } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inquiryClient.findMany({
      where: { idUser: userId, status: { not: "submitted" } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const items: UserNotification[] = [];

  for (const p of pendaftaran) {
    const label =
      p.jenis === "talent" ? "Talent registration" : "Class registration";
    items.push({
      id: `p-${p.idPendaftaran}`,
      kind: "application",
      title: `${label} — ${labelStatus(p.status)}`,
      status: p.status,
      time: p.updatedAt.toISOString(),
      unread: isUnread(p.updatedAt),
      href: "/dashboard",
    });
  }

  for (const i of inquiries) {
    items.push({
      id: `i-${i.idInquiry}`,
      kind: "inquiry",
      title: `Inquiry “${i.judulProject}” — ${labelStatus(i.status)}`,
      status: i.status,
      time: i.updatedAt.toISOString(),
      unread: isUnread(i.updatedAt),
      href: "/collaboration",
    });
  }

  items.sort((a, b) => b.time.localeCompare(a.time));
  const unreadCount = items.reduce((n, it) => n + (it.unread ? 1 : 0), 0);
  return { items, unreadCount };
}

export async function markUserNotificationsRead(
  userId: number,
): Promise<{ ok: boolean }> {
  const user = await prisma.user.findUnique({ where: { idUser: userId } });
  if (!user) return { ok: false };
  await prisma.user.update({
    where: { idUser: userId },
    data: { notifSeenAt: new Date() },
  });
  return { ok: true };
}
