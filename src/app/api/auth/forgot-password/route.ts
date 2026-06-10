import { createResetToken } from "@/server/store";
import { sendResetEmail } from "@/server/email";
import type { ForgotPasswordRequest } from "@/store/api/authApi";

// Always respond with the same generic message, whether or not the email is
// registered. This prevents attackers from probing which emails have accounts
// (email enumeration).
const GENERIC_MESSAGE =
  "Jika email tersebut terdaftar, kami telah mengirim tautan reset password ke kotak masuk Anda.";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ForgotPasswordRequest>;

  if (!body.email) {
    return Response.json({ message: "Email is required." }, { status: 400 });
  }

  const token = createResetToken(body.email);

  // The dev fallback (returning the link in the response) is allowed ONLY
  // outside production, so a real deployment never leaks the token to the
  // client even if email delivery fails.
  const isDev = process.env.NODE_ENV !== "production";
  let devResetUrl: string | undefined;

  if (token) {
    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/auth/reset?token=${token}`;
    const { delivered } = await sendResetEmail({ to: body.email, resetUrl });
    // In development, surface the link whenever the email did NOT actually go
    // out — i.e. no API key, or Resend rejected the recipient (in test mode it
    // only delivers to your own Resend account email). This keeps the flow
    // completable while testing. In production this branch never runs.
    if (isDev && !delivered) {
      devResetUrl = resetUrl;
    }
  }

  return Response.json({
    message: GENERIC_MESSAGE,
    ...(devResetUrl ? { devResetUrl } : {}),
  });
}
