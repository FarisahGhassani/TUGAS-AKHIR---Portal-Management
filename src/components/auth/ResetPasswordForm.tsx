"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResetPasswordMutation } from "@/store/api/authApi";

const MIN_PASSWORD_LENGTH = 6;

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Missing/empty token — the link was malformed or opened without one.
  if (!token) {
    return (
      <section className="space-y-6">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          TAUTAN TIDAK VALID
        </h2>
        <p className="text-body-md text-secondary">
          Tautan reset password tidak lengkap atau salah. Silakan minta tautan
          baru dari halaman login.
        </p>
        <Link
          href="/auth"
          className="inline-block w-full text-center bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:opacity-70 transition-opacity uppercase"
        >
          KE HALAMAN LOGIN
        </Link>
      </section>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      await resetPassword({ token: token as string, password }).unwrap();
      setDone(true);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Tidak dapat mengatur ulang password. Coba lagi.")
          : "Tidak dapat mengatur ulang password. Coba lagi.";
      setError(message);
    }
  }

  // --- success state -------------------------------------------------------
  if (done) {
    return (
      <section className="space-y-6">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          PASSWORD DIPERBARUI
        </h2>
        <p className="text-body-md text-secondary">
          Password Anda berhasil diubah. Sekarang Anda bisa login menggunakan
          password baru.
        </p>
        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="w-full bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:opacity-70 transition-opacity uppercase"
        >
          LOGIN SEKARANG
        </button>
      </section>
    );
  }

  // --- form state ----------------------------------------------------------
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          BUAT PASSWORD BARU
        </h2>
        <p className="text-body-md text-secondary">
          Masukkan password baru Anda dua kali untuk memastikan tidak ada salah
          ketik.
        </p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label
            htmlFor="reset-password"
            className="text-label-uppercase text-primary block uppercase"
          >
            PASSWORD BARU
          </label>
          <input
            id="reset-password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="reset-confirm"
            className="text-label-uppercase text-primary block uppercase"
          >
            ULANGI PASSWORD
          </label>
          <input
            id="reset-confirm"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ketik ulang password baru"
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        {error && (
          <p className="text-caption text-error uppercase tracking-[0.1em]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:opacity-70 transition-opacity uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "MENYIMPAN…" : "SIMPAN PASSWORD BARU"}
        </button>
      </form>
    </section>
  );
}
