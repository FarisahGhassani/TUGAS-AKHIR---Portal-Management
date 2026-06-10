"use client";

import { useState } from "react";
import { useForgotPasswordMutation } from "@/store/api/authApi";

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  // After a successful request we show a confirmation instead of the form.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const result = await forgotPassword({ email }).unwrap();
      setSentTo(email);
      setDevResetUrl(result.devResetUrl ?? null);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Tidak dapat mengirim tautan reset. Coba lagi.")
          : "Tidak dapat mengirim tautan reset. Coba lagi.";
      setError(message);
    }
  }

  // --- confirmation state --------------------------------------------------
  if (sentTo) {
    return (
      <section className="space-y-8">
        <header className="space-y-2">
          <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
            CEK EMAIL ANDA
          </h2>
          <p className="text-body-md text-secondary">
            Jika <span className="text-primary">{sentTo}</span> terdaftar, kami
            telah mengirim tautan untuk mengatur ulang password. Buka email Anda
            lalu klik tautannya.
          </p>
        </header>

        <ol className="space-y-3 text-body-md text-secondary list-decimal pl-5">
          <li>Buka aplikasi email Anda (cek juga folder Spam/Promosi).</li>
          <li>Klik tombol &ldquo;Atur Ulang Password&rdquo; di dalam email.</li>
          <li>Buat password baru. Tautan berlaku 15 menit dan sekali pakai.</li>
        </ol>

        {/* Dev-only helper: shown when no email provider is configured yet. */}
        {devResetUrl && (
          <div className="border border-outline bg-surface-container p-4 space-y-2">
            <p className="text-caption text-secondary uppercase tracking-[0.1em]">
              MODE PENGEMBANGAN — EMAIL BELUM AKTIF
            </p>
            <p className="text-caption text-secondary">
              Belum ada layanan email (RESEND_API_KEY) yang dipasang, jadi
              tautan reset ditampilkan di sini untuk pengujian:
            </p>
            <a
              href={devResetUrl}
              className="text-caption text-primary underline decoration-1 underline-offset-4 break-all"
            >
              {devResetUrl}
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          className="w-full bg-transparent border border-primary text-primary text-label-uppercase py-4 px-8 hover:bg-surface-container transition-colors uppercase"
        >
          KEMBALI KE LOGIN
        </button>
      </section>
    );
  }

  // --- request form --------------------------------------------------------
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          LUPA PASSWORD
        </h2>
        <p className="text-body-md text-secondary">
          Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat
          password baru.
        </p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label
            htmlFor="forgot-email"
            className="text-label-uppercase text-primary block uppercase"
          >
            EMAIL
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email here..."
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
          {isLoading ? "MENGIRIM…" : "KIRIM TAUTAN RESET"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-caption text-secondary hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
        >
          Kembali ke login
        </button>
      </form>
    </section>
  );
}
