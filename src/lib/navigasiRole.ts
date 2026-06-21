import type { AuthRole } from "@/store/api/authApi";

// Nentuin halaman tujuan sesuai role user. Satu sumber kebenaran biar gak
// beda-beda di tiap file (dipakai pas habis login, habis daftar, dan pas user
// yang udah login nyasar ke halaman /auth).
export function tujuanSetelahLogin(role: AuthRole): string {
  if (role === "admin") return "/admin";
  if (role === "talent") return "/dashboard"; // halaman dashboard "HI ELARA"
  return "/talent"; // client → katalog talent
}
