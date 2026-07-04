import { getSiteAssets } from "@/server/db/siteAssets";

// Aset situs (hero video, gambar essence/auth) dibaca landing & halaman auth.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getSiteAssets());
}
