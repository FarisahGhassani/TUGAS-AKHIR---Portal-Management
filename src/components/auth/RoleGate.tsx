"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/authSlice";
import type { AuthRole } from "@/store/api/authApi";

const roleLabel: Record<AuthRole, string> = {
  talent: "Talent",
  client: "Client",
  admin: "Admin",
};

/**
 * Membatasi sebuah halaman ke satu role saja. Sumber kebenaran adalah auth
 * state di Redux (RTK) — `s.auth.user.role` yang diisi saat login/register.
 *
 * - role cocok          → render konten.
 * - login dengan role lain → tawarkan "ganti akun" (logout → /auth).
 * - belum login          → arahkan login / daftar dengan role yang sesuai.
 *
 * Karena tiap akun hanya punya SATU role (dipilih saat registrasi), tidak ada
 * peralihan role di dalam satu sesi — pengguna harus memakai/membuat akun yang
 * sesuai. Itulah kenapa di sini tidak ada pilihan "continue as talent/client".
 */
export function RoleGate({
  allow,
  children,
}: {
  allow: AuthRole;
  children: React.ReactNode;
}) {
  const role = useAppSelector((s) => s.auth.user?.role ?? null);
  if (role === allow) return <>{children}</>;
  return <AccessNotice required={allow} currentRole={role} />;
}

function AccessNotice({
  required,
  currentRole,
}: {
  required: AuthRole;
  currentRole: AuthRole | null;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const label = roleLabel[required];
  const loggedInWrongRole = currentRole !== null;

  // Kalau yang dibutuhin akun talent, bawa ?intent=agency biar di /auth tab
  // daftar langsung kebuka & role Talent ke-preselect. Selain itu /auth biasa.
  const linkAuth = required === "talent" ? "/auth?intent=agency" : "/auth";

  function switchAccount() {
    // Keluar dari akun yang role-nya tidak sesuai, lalu ke halaman auth supaya
    // pengguna bisa masuk dengan akun yang benar (atau membuatnya).
    dispatch(clearCredentials());
    router.push(linkAuth);
  }

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-section max-w-editorial mx-auto">
      <p className="text-label-uppercase text-secondary uppercase mb-4">
        RESTRICTED ACCESS
      </p>
      <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95] mb-6">
        {label.toUpperCase()} ACCOUNT ONLY
      </h1>
      <p className="text-body-lg text-secondary max-w-prose mb-10">
        {loggedInWrongRole
          ? `You are signed in as a ${roleLabel[currentRole]} account. This page is only for ${label} accounts. Sign out and log in with a ${label} account, or create one first.`
          : `Log in or sign up as a ${label} to access this page.`}
      </p>
      {loggedInWrongRole ? (
        <button
          type="button"
          onClick={switchAccount}
          className="inline-block text-label-uppercase text-on-primary bg-primary px-8 py-4 hover:bg-accent transition-colors uppercase"
        >
          SWITCH TO {label.toUpperCase()} ACCOUNT
        </button>
      ) : (
        <Link
          href={linkAuth}
          className="inline-block text-label-uppercase text-on-primary bg-primary px-8 py-4 hover:bg-accent transition-colors uppercase"
        >
          LOG IN / SIGN UP AS {label.toUpperCase()}
        </Link>
      )}
    </section>
  );
}
