import { getLandingContent } from "@/server/db/landing";

// Konten landing dibaca dari MySQL (site_content). Jangan cache.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getLandingContent());
}
