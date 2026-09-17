"use client";

import { useAppSelector } from "@/store/hooks";
import { useGetNotificationsQuery } from "@/store/api/notificationsApi";

/**
 * Titik merah kecil "ada update belum dibaca" untuk user (talent/client).
 * PUSH ringan: menyala saat ada perubahan status pendaftaran/inquiry yang belum
 * dilihat (unreadCount > 0, dihitung server vs user.notifSeenAt). Hilang setelah
 * user membuka halaman statusnya (yang menandai sudah dibaca). Render null untuk
 * guest & admin. Square dot mengikuti gaya sudut tajam desain.
 */
export function NotificationDot() {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user && user.role !== "admin" ? user.id : undefined;
  const { data } = useGetNotificationsQuery(userId ?? "", {
    skip: !userId,
    pollingInterval: 60000,
  });

  if (!userId || !data || data.unreadCount === 0) return null;

  return (
    <span
      role="status"
      aria-label={`${data.unreadCount} update belum dibaca`}
      title="Ada update status baru"
      className="ml-1 inline-block h-2 w-2 shrink-0 bg-error align-top"
    />
  );
}
