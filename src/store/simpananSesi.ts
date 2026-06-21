// File ini tugasnya cuma satu: nyimpen & ngambil data login dari localStorage
// (penyimpanan kecil bawaan browser yang gak ilang walau halaman di-refresh).
// Tujuannya biar pas halaman di-reload, web gak "lupa" siapa yang lagi login.
//
// Soal "token": token itu cuma teks acak dari server yang jadi bukti kalau kita
// udah login (anggap aja kayak tiket masuk / gelang konser). Kita gak perlu
// ngerti isinya — cukup disimpan, terus dikasih lagi ke server kalau dibutuhin.

import type { AuthUser } from "@/store/api/authApi";

// Nama "laci" di localStorage tempat kita naruh data login.
const KUNCI = "portal-sesi";

// Bentuk data yang kita simpan: siapa user-nya + tiket/token-nya.
type Sesi = { user: AuthUser; token: string };

// Ambil data login yang tersimpan. Kalau gak ada atau datanya rusak → null.
export function bacaSesi(): Sesi | null {
  // localStorage cuma ada di browser. Pas Next.js nyiapin halaman di server,
  // "window" belum ada — jadi kita amanin dulu biar gak error.
  if (typeof window === "undefined") return null;

  const teks = window.localStorage.getItem(KUNCI);
  if (!teks) return null;

  try {
    return JSON.parse(teks) as Sesi;
  } catch {
    // Datanya rusak / bukan JSON yang bener → anggap aja gak ada.
    return null;
  }
}

// Simpan data login. Dipanggil pas berhasil login atau daftar.
export function simpanSesi(sesi: Sesi) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI, JSON.stringify(sesi));
}

// Hapus data login. Dipanggil pas logout.
export function hapusSesi() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KUNCI);
}
