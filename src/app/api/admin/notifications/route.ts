import { listAdminNotifications } from "@/server/db/notifications";
import { markUserNotificationsRead } from "@/server/db/userNotifications";

// Notifikasi admin dari MySQL (pendaftaran + inquiry terbaru). Jangan cache.
export const dynamic = "force-dynamic";

// ?userId = admin yang login → dipakai menghitung `unread` vs notifSeenAt-nya.
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("userId");
  const userId = raw ? Number(raw) : undefined;
  const adminId =
    userId && Number.isInteger(userId) && userId > 0 ? userId : undefined;
  return Response.json(await listAdminNotifications(adminId));
}

// Tandai notifikasi admin sudah dibaca (set notifSeenAt admin = now). Admin juga
// sebuah `user`, jadi memakai helper yang sama dengan sisi user.
export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string | number };
  const userId = Number(body.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return Response.json({ ok: false }, { status: 400 });
  }
  return Response.json(await markUserNotificationsRead(userId));
}
