// ---------------------------------------------------------------------------
// Format & turunan data talent yang dipakai lintas lapisan (layer DB + form
// admin). Semua murni fungsi: tidak menyentuh DB, tidak menyimpan state.
// ---------------------------------------------------------------------------

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// cm → label kaki/inci (mis. 178 → 5'10") supaya kartu & detail tetap konsisten
// tanpa admin perlu mengisi manual.
export function cmToHeightLabel(cm: number): string {
  if (!cm || cm <= 0) return "";
  const totalInches = Math.round(cm / 2.54);
  const ft = Math.floor(totalInches / 12);
  const inch = totalInches % 12;
  return `${ft}'${inch}"`;
}

// --- Ukuran sepatu ---------------------------------------------------------
// Form hanya meminta ukuran EROPA (angka). UK diturunkan OTOMATIS di sisi
// API/server, jadi DB cukup menyimpan angka EU mentah (mis. "42").

// Ambil angka EU dari string apa pun ("42", "42 EU", "42 EU / 8 UK") → "42".
// String kosong bila tidak ada angka (mis. data lama "-").
export function parseShoeEu(raw: string): string {
  const eu = parseInt(raw, 10);
  return Number.isFinite(eu) && eu > 0 ? String(eu) : "";
}

// EU → UK (perkiraan linear, dibulatkan ke 0.5 terdekat). Cukup untuk comp card;
// konversi sepatu tidak pernah 100% linear antar-merek.
export function euToUkShoe(eu: number): number {
  const uk = 2.5 + (eu - 35) * (8.5 / 11);
  return Math.round(uk * 2) / 2;
}

// "42" (atau "42 EU") → "42 EU / 8 UK". Bila tak ada angka, kembalikan apa
// adanya supaya data lama/placeholder ("-") tetap tampil.
export function formatShoeSize(raw: string): string {
  const eu = parseInt(raw, 10);
  if (!Number.isFinite(eu) || eu <= 0) return raw;
  const uk = euToUkShoe(eu);
  const ukLabel = Number.isInteger(uk) ? String(uk) : uk.toFixed(1);
  return `${eu} EU / ${ukLabel} UK`;
}
