import { listTalentApplications } from "@/server/db/talents";

// Daftar pendaftaran talent untuk panel approval admin (MySQL via Prisma).
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listTalentApplications());
}
