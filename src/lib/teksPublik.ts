// ---------------------------------------------------------------------------
// Normalisasi teks yang TAMPIL KE PUBLIK.
//
// Judul (pengumuman, project, event, nama batch) selalu disimpan & ditampilkan
// KAPITAL supaya seragam di landing/katalog — tidak bergantung cara admin
// mengetik. Dipakai di dua sisi: input form (biar admin langsung melihat
// hasilnya saat mengetik) dan layer DB (biar data yang tersimpan tetap seragam
// walau request datang dari luar form).
// ---------------------------------------------------------------------------

export function judulPublik(value: string): string {
  return value.trim().toUpperCase();
}

// Versi untuk onChange input: jangan di-trim (spasi di tengah pengetikan masih
// dibutuhkan), cukup kapitalkan.
export function ketikKapital(value: string): string {
  return value.toUpperCase();
}
