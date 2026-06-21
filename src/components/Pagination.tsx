"use client";

/**
 * Paginasi bernomor untuk daftar/tabel: 10 baris per halaman, dengan tombol
 * angka 1, 2, 3 … yang bisa diklik (halaman aktif disorot) plus Prev/Next.
 * Untuk banyak halaman, angka di-window dengan "…" agar tidak over.
 * Dikontrol penuh lewat props (page 1-based) supaya pemanggil simpan state-nya.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const pages = pageNumbers(current, pageCount);

  const navBtn =
    "px-3 py-2 text-label-uppercase uppercase border border-outline text-primary transition-colors hover:enabled:bg-primary hover:enabled:text-on-primary disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
      <p className="text-label-uppercase text-secondary uppercase">
        Menampilkan {start}-{end} dari {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          className={navBtn}
        >
          Sebelumnya
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className="px-2 text-label-uppercase text-on-surface-variant"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === current ? "page" : undefined}
              className={`w-10 py-2 text-label-uppercase uppercase border transition-colors tabular-nums ${
                p === current
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline text-primary hover:bg-surface-container-low"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= pageCount}
          className={navBtn}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

// Daftar nomor halaman yang ditampilkan: selalu 1 & terakhir, current ±1, sisanya "…".
function pageNumbers(current: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(pageCount - 1, current + 1);
  if (left > 2) out.push("…");
  for (let p = left; p <= right; p++) out.push(p);
  if (right < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}
