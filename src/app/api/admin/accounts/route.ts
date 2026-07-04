import { listAccounts } from "@/server/users";

// Dibaca langsung dari tabel `user` (MySQL via Prisma) — jangan cache.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listAccounts());
}
