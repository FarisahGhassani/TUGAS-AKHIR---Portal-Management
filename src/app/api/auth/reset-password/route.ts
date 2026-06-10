import { consumeResetToken } from "@/server/store";
import type { ResetPasswordRequest } from "@/store/api/authApi";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ResetPasswordRequest>;

  if (!body.token) {
    return Response.json(
      { message: "Tautan reset tidak valid. Silakan minta tautan baru." },
      { status: 400 },
    );
  }

  if (!body.password || body.password.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.` },
      { status: 400 },
    );
  }

  const result = consumeResetToken(body.token, body.password);
  if (!result.ok) {
    // We keep the message generic across invalid/expired/used so the response
    // doesn't reveal token state to anyone guessing tokens.
    return Response.json(
      {
        message:
          "Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.",
      },
      { status: 400 },
    );
  }

  return Response.json({
    message:
      "Password berhasil diperbarui. Silakan login dengan password baru Anda.",
  });
}
