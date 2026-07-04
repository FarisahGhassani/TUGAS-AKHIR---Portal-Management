import { setSiteAsset, SITE_ASSET_KEYS } from "@/server/db/siteAssets";
import type { SiteAssetKey } from "@/store/api/siteAssetsApi";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const body = (await request.json()) as { key?: SiteAssetKey; value?: string };
  if (!body.key || !SITE_ASSET_KEYS.includes(body.key)) {
    return Response.json({ message: "Aset tidak dikenal." }, { status: 422 });
  }
  const updated = await setSiteAsset(body.key, (body.value ?? "").trim());
  return Response.json(updated);
}
