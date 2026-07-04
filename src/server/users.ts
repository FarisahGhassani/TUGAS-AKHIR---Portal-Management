// ---------------------------------------------------------------------------
// DB-backed user & auth operations.
//
// Menggantikan fungsi auth in-memory di `src/server/store.ts`. Semua data user
// sekarang dibaca/ditulis ke MySQL lewat Prisma, dan password disimpan sebagai
// hash bcrypt (bukan plaintext).
//
// Token reset password tetap disimpan di memori server (ephemeral, 15 menit):
// sifatnya sementara dan hanya perlu hidup selama proses server berjalan,
// sedangkan UPDATE password-nya tetap menulis ke database.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { AuthRole, AuthUser } from "@/store/api/authApi";
import type { AdminAccountsResponse } from "@/store/api/adminApi";
import type { User } from "@prisma/client";

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // token reset berlaku 15 menit

type ResetToken = {
  email: string;
  expiresAt: number;
  used: boolean;
};

// Simpan map token di globalThis supaya bertahan terhadap reload modul (HMR)
// selama `next dev` dan dibagikan oleh semua Route Handler.
const globalForReset = globalThis as unknown as {
  __resetTokens?: Map<string, ResetToken>;
};
const resetTokens = (globalForReset.__resetTokens ??= new Map<string, ResetToken>());

// --- helpers ---------------------------------------------------------------

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Bentuk user yang aman dikirim ke client — TANPA password hash.
function toAuthUser(u: User): AuthUser {
  return {
    id: String(u.idUser),
    name: u.nama,
    email: u.email,
    role: u.role as AuthRole,
  };
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// --- auth ------------------------------------------------------------------

export async function emailExists(email: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
  return Boolean(u);
}

/** Returns the public user when credentials match, otherwise null. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const u = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
  if (!u) return null;

  const ok = await bcrypt.compare(password, u.password);
  return ok ? toAuthUser(u) : null;
}

export async function createUser(input: {
  nama: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, "admin">;
}): Promise<AuthUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const u = await prisma.user.create({
    data: {
      nama: input.nama,
      email: normalizeEmail(input.email),
      password: passwordHash,
      role: input.role,
    },
  });
  return toAuthUser(u);
}

// --- admin: account directory ----------------------------------------------

// Daftar seluruh akun terdaftar untuk panel admin — dibaca LANGSUNG dari tabel
// `user` (MySQL), jadi register/login & daftar akun admin selalu sinkron.
export async function listAccounts(): Promise<AdminAccountsResponse> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  const accounts = users.map((u) => ({
    id: String(u.idUser),
    name: u.nama,
    email: u.email,
    role: u.role as AuthRole,
    createdAt: u.createdAt.toISOString(),
  }));
  const totals = accounts.reduce<Record<AuthRole, number>>(
    (acc, a) => {
      acc[a.role] = (acc[a.role] ?? 0) + 1;
      return acc;
    },
    { admin: 0, talent: 0, client: 0 },
  );
  return { accounts, totals };
}

// --- password reset --------------------------------------------------------

/**
 * Create a single-use, time-limited reset token for the given email.
 * Returns null when no account matches — callers MUST still respond
 * generically so they don't reveal which emails are registered.
 */
export async function createResetToken(email: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
  if (!u) return null;

  const token = generateToken();
  resetTokens.set(token, {
    email: u.email,
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    used: false,
  });
  return token;
}

type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/**
 * Validate a reset token and, when valid, update the matching user's password
 * (stored as a bcrypt hash). The token is marked used so it can't be replayed.
 */
export async function consumeResetToken(
  token: string,
  newPassword: string,
): Promise<ConsumeResult> {
  const entry = resetTokens.get(token);
  if (!entry) return { ok: false, reason: "invalid" };
  if (entry.used) return { ok: false, reason: "used" };
  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    return { ok: false, reason: "expired" };
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  try {
    await prisma.user.update({
      where: { email: entry.email },
      data: { password: passwordHash },
    });
  } catch {
    return { ok: false, reason: "invalid" };
  }

  entry.used = true;
  return { ok: true };
}
