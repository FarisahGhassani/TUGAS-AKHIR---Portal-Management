// ---------------------------------------------------------------------------
// Landing content — DB-backed. Disimpan di tabel `site_setting` (key="landing",
// value = JSON string LandingContent) — satu tabel dengan aset situs. Jika
// belum ada, pakai default dari mock sebagai fallback. Admin mengedit teks
// (essence/capabilities/cta) lewat /admin/assets.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { landingContent as defaults } from "@/lib/landingDefaults";
import type { LandingContent } from "@/store/api/landingApi";

const LANDING_KEY = "landing";

export async function getLandingContent(): Promise<LandingContent> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: LANDING_KEY },
  });
  if (!row) return defaults;
  try {
    return JSON.parse(row.value) as LandingContent;
  } catch {
    return defaults;
  }
}

export async function updateLandingContent(
  patch: Partial<LandingContent>,
): Promise<LandingContent> {
  const current = await getLandingContent();
  // Merge per-section (editor mengirim section utuh: essence/capabilities/cta).
  const next: LandingContent = { ...current, ...patch };
  const value = JSON.stringify(next);
  await prisma.siteSetting.upsert({
    where: { key: LANDING_KEY },
    update: { value },
    create: { key: LANDING_KEY, value },
  });
  return next;
}
