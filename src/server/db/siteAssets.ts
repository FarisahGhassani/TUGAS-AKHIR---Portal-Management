// ---------------------------------------------------------------------------
// Site assets (key-value) — aset situs yang bisa diganti admin: hero video,
// gambar essence, gambar auth. Disimpan di tabel `site_asset` (Prisma/MySQL).
// Nilai kosong → halaman memakai default bawaannya.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { SiteAssetKey, SiteAssets } from "@/store/api/siteAssetsApi";

export const SITE_ASSET_KEYS: SiteAssetKey[] = [
  "hero_video",
  "essence_image",
  "auth_image",
];

export async function getSiteAssets(): Promise<SiteAssets> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: SITE_ASSET_KEYS } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    heroVideo: map.get("hero_video") ?? "",
    essenceImage: map.get("essence_image") ?? "",
    authImage: map.get("auth_image") ?? "",
  };
}

export async function updateSiteAsset(
  key: SiteAssetKey,
  value: string,
): Promise<SiteAssets> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return getSiteAssets();
}
