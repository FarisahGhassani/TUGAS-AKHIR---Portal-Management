"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/authSlice";

/**
 * Tombol logout yang dipakai bersama di semua dashboard (talent lewat NavBar,
 * admin lewat DashboardShell). Logout = bersihkan auth state di Redux (RTK) —
 * yang sekaligus menghapus sesi di localStorage — lalu antar ke /auth.
 *
 * Karena alurnya sama untuk SETIAP role/akun, komponen ini sengaja dibikin
 * generik: tampilannya diatur lewat `className`, isinya lewat `label`.
 */
export function LogoutButton({
  className,
  label = "LOGOUT",
  onClick,
}: {
  className?: string;
  label?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  function handleLogout() {
    // Panggil callback dulu (mis. menutup menu mobile) sebelum pindah halaman.
    onClick?.();
    dispatch(clearCredentials());
    router.push("/auth");
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {label}
    </button>
  );
}
