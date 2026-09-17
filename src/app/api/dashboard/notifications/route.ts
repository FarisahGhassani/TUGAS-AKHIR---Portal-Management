import {
  listUserNotifications,
  markUserNotificationsRead,
} from "@/server/db/userNotifications";
import type { UserNotificationsResponse } from "@/store/api/notificationsApi";

// Per-user, dari MySQL. Jangan cache.
export const dynamic = "force-dynamic";

const EMPTY: UserNotificationsResponse = { items: [], unreadCount: 0 };

// Daftar notifikasi + jumlah unread milik user (dari status pendaftaran/inquiry).
export async function GET(request: Request) {
  const userId = Number(new URL(request.url).searchParams.get("userId"));
  if (!Number.isInteger(userId) || userId <= 0) {
    return Response.json(EMPTY);
  }
  return Response.json(await listUserNotifications(userId));
}

// Tandai semua notifikasi user sudah dibaca (set notifSeenAt = now).
export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string | number };
  const userId = Number(body.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return Response.json({ ok: false }, { status: 400 });
  }
  return Response.json(await markUserNotificationsRead(userId));
}
