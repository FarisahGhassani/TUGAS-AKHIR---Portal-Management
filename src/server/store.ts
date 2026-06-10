// ---------------------------------------------------------------------------
// Server-side in-memory store — single source of truth for auth + accounts.
//
// This replaces the browser-side MSW mock for everything that must stay
// consistent across the forgot-password flow: login, register, the reset
// tokens, and the account/overview data the admin screens read.
//
// Why server-side? A password-reset link in an email can be opened at any time,
// even from a different device or browser. The reset token therefore cannot
// live in browser memory (it would be gone after a reload) — it must live here,
// on the server, alongside the user records it mutates.
//
// PROD NOTE: this is an in-memory store seeded on boot, so it resets when the
// server restarts. To go to production, swap these functions for a real
// database (e.g. Postgres/Prisma) and store password *hashes* (bcrypt/argon2),
// never plaintext. The function signatures are designed so only the bodies
// need to change.
// ---------------------------------------------------------------------------

import { seedUsers, type StoredUser } from "@/mocks/data/users";
import { adminOverview as seedOverview } from "@/mocks/data/admin";
import type { AuthRole, AuthUser } from "@/store/api/authApi";
import type { AdminOverview } from "@/store/api/adminApi";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // tokens expire after 15 minutes

type ResetToken = {
  email: string;
  expiresAt: number;
  used: boolean;
};

type Store = {
  users: StoredUser[];
  overview: AdminOverview;
  resetTokens: Map<string, ResetToken>;
};

// Stash the store on globalThis so every Route Handler shares one instance and
// it survives Turbopack/HMR module reloads during `next dev`.
const globalForStore = globalThis as unknown as { __portalStore?: Store };

function createStore(): Store {
  return {
    users: structuredClone(seedUsers),
    overview: structuredClone(seedOverview),
    resetTokens: new Map(),
  };
}

const store = (globalForStore.__portalStore ??= createStore());

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

// --- helpers ---------------------------------------------------------------

function toPublicUser(user: StoredUser): AuthUser {
  // Strip the password (and createdAt) before sending a user to the client.
  const { password: _password, createdAt: _createdAt, ...publicUser } = user;
  void _password;
  void _createdAt;
  return publicUser;
}

function findRecord(email: string): StoredUser | undefined {
  return store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// --- auth ------------------------------------------------------------------

export function emailExists(email: string): boolean {
  return Boolean(findRecord(email));
}

/** Returns the public user when credentials match, otherwise null. */
export function verifyCredentials(
  email: string,
  password: string,
): AuthUser | null {
  const user = findRecord(email);
  if (!user || user.password !== password) return null;
  return toPublicUser(user);
}

export function addUser(input: {
  name: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, "admin">;
}): AuthUser {
  const id = `u-${input.role}-${Date.now()}`;
  const record: StoredUser = {
    id,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  store.users.push(record);

  // Mirror the old MSW behaviour: a new registration shows up on the admin
  // dashboard as a talent application or a client inquiry.
  if (input.role === "talent") {
    store.overview.applications.unshift({
      id: `a-${id}`,
      name: input.name,
      appliedAt: dateFormatter.format(new Date()),
      category: "Pending Review",
      status: "new",
    });
    store.overview.metrics.pendingApplications += 1;
  } else {
    store.overview.inquiries.unshift({
      id: `ci-${id}`,
      client: input.name.toUpperCase(),
      receivedAgo: "Just now",
      excerpt: `New client account registered by ${input.name}. Awaiting brief details.`,
    });
    store.overview.metrics.newInquiries += 1;
  }

  return toPublicUser(record);
}

// --- admin reads -----------------------------------------------------------

export function listAccounts() {
  const accounts = [...store.users]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ password: _pw, ...rest }) => {
      void _pw;
      return rest;
    });
  const totals = accounts.reduce<Record<AuthRole, number>>(
    (acc, account) => {
      acc[account.role] = (acc[account.role] ?? 0) + 1;
      return acc;
    },
    { admin: 0, talent: 0, client: 0 },
  );
  return { accounts, totals };
}

export function getOverview(): AdminOverview {
  return store.overview;
}

// --- password reset --------------------------------------------------------

/**
 * Create a single-use, time-limited reset token for the given email.
 * Returns null when no account matches — callers MUST still respond
 * generically so they don't reveal which emails are registered.
 */
export function createResetToken(email: string): string | null {
  const user = findRecord(email);
  if (!user) return null;

  const token = generateToken();
  store.resetTokens.set(token, {
    email: user.email,
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    used: false,
  });
  return token;
}

type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/**
 * Validate a reset token and, when valid, update the matching user's password.
 * The token is marked used so it can never be replayed.
 */
export function consumeResetToken(
  token: string,
  newPassword: string,
): ConsumeResult {
  const entry = store.resetTokens.get(token);
  if (!entry) return { ok: false, reason: "invalid" };
  if (entry.used) return { ok: false, reason: "used" };
  if (Date.now() > entry.expiresAt) {
    store.resetTokens.delete(token);
    return { ok: false, reason: "expired" };
  }

  const user = findRecord(entry.email);
  if (!user) return { ok: false, reason: "invalid" };

  // PROD NOTE: store a hash here, never the plaintext password.
  user.password = newPassword;
  entry.used = true;
  return { ok: true };
}
