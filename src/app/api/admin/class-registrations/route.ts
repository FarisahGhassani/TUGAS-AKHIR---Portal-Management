import { listClassRegistrations } from "@/server/db/batches";

// Daftar pendaftaran kelas untuk panel approval admin (MySQL via Prisma).
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listClassRegistrations());
}
