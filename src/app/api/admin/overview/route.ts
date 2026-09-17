import { getDashboardMetrics } from "@/server/db/overview";

// Metrik dashboard admin dihitung dari MySQL (Prisma) — jangan cache.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getDashboardMetrics());
}
