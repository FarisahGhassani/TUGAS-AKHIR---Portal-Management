import { getOverview } from "@/server/store";

// Reflects new registrations as they happen, so it must never be cached.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getOverview());
}
