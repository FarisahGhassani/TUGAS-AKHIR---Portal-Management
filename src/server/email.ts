// ---------------------------------------------------------------------------
// Password-reset email delivery.
//
// When RESEND_API_KEY is set, the reset link is sent as a real email via
// Resend. When it is NOT set (e.g. you haven't signed up yet), we fall back to
// printing the link to the server console so the whole flow is still testable
// in development.
//
// SETUP (test with your own email, no domain needed):
//   1. Create a free account at https://resend.com
//   2. Copy your API key into .env.local:  RESEND_API_KEY=re_xxx
//   3. Without a verified domain, Resend only delivers FROM onboarding@resend.dev
//      and only TO the email address of your own Resend account. That is enough
//      for a demo. To send to any address, verify a domain in Resend and change
//      RESET_FROM below to an address on that domain.
// ---------------------------------------------------------------------------

import { Resend } from "resend";

const RESET_FROM = "Portal Management <onboarding@resend.dev>";

type SendResetEmailInput = {
  to: string;
  resetUrl: string;
};

type SendResetResult = {
  /** true when a real email was dispatched; false when we used the dev fallback */
  delivered: boolean;
};

function buildHtml(resetUrl: string): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 480px; margin: 0 auto;">
    <h1 style="font-size: 20px; letter-spacing: 0.5px;">Reset Password Anda</h1>
    <p>Kami menerima permintaan untuk mengatur ulang password akun Portal Management Anda.</p>
    <p>Klik tombol di bawah ini untuk membuat password baru. Tautan ini hanya berlaku <strong>15 menit</strong> dan hanya bisa dipakai sekali.</p>
    <p style="margin: 28px 0;">
      <a href="${resetUrl}"
         style="background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 28px;display:inline-block;letter-spacing:1px;text-transform:uppercase;font-size:13px;">
        Atur Ulang Password
      </a>
    </p>
    <p style="font-size: 13px; color: #555;">Atau salin dan tempel tautan ini ke browser Anda:</p>
    <p style="font-size: 13px; color: #555; word-break: break-all;">${resetUrl}</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
    <p style="font-size: 12px; color: #888;">
      Jika Anda tidak meminta perubahan ini, abaikan email ini — password Anda tidak akan berubah.
    </p>
  </div>`;
}

function buildText(resetUrl: string): string {
  return [
    "Reset Password Anda",
    "",
    "Kami menerima permintaan untuk mengatur ulang password akun Portal Management Anda.",
    "Buka tautan berikut untuk membuat password baru (berlaku 15 menit, sekali pakai):",
    "",
    resetUrl,
    "",
    "Jika Anda tidak meminta perubahan ini, abaikan email ini.",
  ].join("\n");
}

export async function sendResetEmail({
  to,
  resetUrl,
}: SendResetEmailInput): Promise<SendResetResult> {
  const apiKey = process.env.RESEND_API_KEY;

  // Dev fallback: no API key configured yet.
  if (!apiKey) {
    console.log(
      "\n[forgot-password] RESEND_API_KEY belum diisi — memakai fallback dev.",
    );
    console.log(`[forgot-password] Tautan reset untuk ${to}:`);
    console.log(`${resetUrl}\n`);
    return { delivered: false };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: RESET_FROM,
    to,
    subject: "Reset password akun Portal Management Anda",
    html: buildHtml(resetUrl),
    text: buildText(resetUrl),
  });

  if (error) {
    // Log for the developer, but don't surface details to the client (the
    // route returns a generic message either way to avoid leaking account info).
    console.error("[forgot-password] Resend gagal mengirim email:", error);
    return { delivered: false };
  }

  return { delivered: true };
}
