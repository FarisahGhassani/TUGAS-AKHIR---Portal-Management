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
import { seedAnnouncements } from "@/mocks/data/announcements";
import { slugify } from "@/mocks/data/talents";
import { projects as seedProjects } from "@/mocks/data/projects";
import type { AuthRole, AuthUser } from "@/store/api/authApi";
import type {
  AdminNotification,
  AdminOverview,
  ApplicationStatus,
  OverviewData,
} from "@/store/api/adminApi";
import type {
  Announcement,
  AnnouncementInput,
} from "@/store/api/announcementsApi";
import type {
  Project,
  ProjectInput,
  ProjectListQuery,
} from "@/store/api/projectsApi";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // tokens expire after 15 minutes

type ResetToken = {
  email: string;
  expiresAt: number;
  used: boolean;
};

type Store = {
  users: StoredUser[];
  overview: OverviewData;
  announcements: Announcement[];
  projects: Project[];
  resetTokens: Map<string, ResetToken>;
};

// Stash the store on globalThis so every Route Handler shares one instance and
// it survives Turbopack/HMR module reloads during `next dev`.
const globalForStore = globalThis as unknown as { __portalStore?: Store };

function createStore(): Store {
  return {
    users: structuredClone(seedUsers),
    overview: structuredClone(seedOverview),
    announcements: structuredClone(seedAnnouncements),
    projects: structuredClone(seedProjects),
    resetTokens: new Map(),
  };
}

const store = (globalForStore.__portalStore ??= createStore());

// Defensif: kalau store lama (dari HMR) belum punya field yang baru ditambah,
// isi dari seed supaya tidak undefined.
store.announcements ??= structuredClone(seedAnnouncements);
store.projects ??= structuredClone(seedProjects);

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

// Rakit feed "notifikasi terbaru" dari pendaftaran & inquiry yang sudah ada.
// Keduanya tersimpan newest-first (unshift), jadi kita interleave bergantian
// supaya kedua jenis sama-sama tampil teratas, dibatasi 6 item.
const statusLabelId: Record<ApplicationStatus, string> = {
  new: "baru",
  under_review: "ditinjau",
  approved: "disetujui",
  declined: "ditolak",
};

function buildNotifications(overview: OverviewData): AdminNotification[] {
  const fromApplications: AdminNotification[] = overview.applications.map(
    (a) => ({
      id: `n-${a.id}`,
      kind: "application",
      title: `Pendaftaran talent baru dari ${a.name}`,
      detail: `${a.category} · ${statusLabelId[a.status]}`,
      time: a.appliedAt,
    }),
  );
  const fromInquiries: AdminNotification[] = overview.inquiries.map((i) => ({
    id: `n-${i.id}`,
    kind: "inquiry",
    title: `Inquiry klien baru dari ${i.client}`,
    detail: i.excerpt,
    time: i.receivedAgo,
  }));

  const merged: AdminNotification[] = [];
  for (let i = 0; i < Math.max(fromApplications.length, fromInquiries.length); i++) {
    if (fromApplications[i]) merged.push(fromApplications[i]);
    if (fromInquiries[i]) merged.push(fromInquiries[i]);
  }
  return merged.slice(0, 6);
}

export function getOverview(): AdminOverview {
  return {
    ...store.overview,
    notifications: buildNotifications(store.overview),
  };
}

// --- announcements (CRUD) -------------------------------------------------
// Dibaca landing page (status=aktif) DAN panel admin (semua). Karena state-nya
// ada di server, apa yang dibuat admin langsung tampil di guest/landing tanpa
// bergantung pada memori browser yang reset tiap reload.

function isExpired(tanggalBerakhir: string, now: Date = new Date()): boolean {
  const deadline = new Date(`${tanggalBerakhir}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return false;
  const startOfDeadline = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
  );
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return startOfDeadline.getTime() < startOfToday.getTime();
}

export function listAllAnnouncements(): Announcement[] {
  return store.announcements;
}

export function listActiveAnnouncements(): Announcement[] {
  return store.announcements.filter(
    (a) => a.status === "aktif" && !isExpired(a.tanggalBerakhir),
  );
}

export function createAnnouncement(input: AnnouncementInput): Announcement {
  const created: Announcement = { id: `ann-${Date.now()}`, ...input };
  store.announcements.unshift(created);
  return created;
}

export function updateAnnouncement(
  id: string,
  patch: Partial<AnnouncementInput>,
): Announcement | null {
  const idx = store.announcements.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.announcements[idx] = { ...store.announcements[idx], ...patch };
  return store.announcements[idx];
}

export function deleteAnnouncement(id: string): boolean {
  const idx = store.announcements.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  store.announcements.splice(idx, 1);
  return true;
}

// NOTE: Talent CRUD dipindah ke MySQL (Prisma) di `src/server/db/talents.ts`
// — talent = pendaftar lolos (join pendaftaran↔talent). Tidak lagi di store ini.

// projects kurang lebih crud kaya nnouncement
// Perubahan admin PERSIST melewati reload & langsung tampil di halaman publik

const projectDateLabelFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

// ISO "2025-03-04" → "March 2025" (dipakai kartu project di sisi publik).
function toProjectDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : projectDateLabelFmt.format(d);
}

function uniqueProjectSlug(base: string): string {
  const root = base || `project-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (store.projects.some((p) => p.slug === slug)) slug = `${root}-${n++}`;
  return slug;
}

export function listPublicProjects(params: ProjectListQuery): Project[] {
  return store.projects
    .filter((p) => {
      if (
        params.search &&
        !`${p.title} ${p.event}`
          .toLowerCase()
          .includes(params.search.toLowerCase())
      )
        return false;
      if (params.type && params.type !== "all" && p.type !== params.type)
        return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function listAllProjects(): Project[] {
  return [...store.projects].sort((a, b) => b.date.localeCompare(a.date));
}

export function createProject(input: ProjectInput): Project {
  const slug = uniqueProjectSlug(slugify(input.title));
  const project: Project = {
    id: `p-${slug}`,
    slug,
    title: input.title.trim(),
    event: input.event.trim(),
    type: input.type,
    date: input.date,
    dateLabel: toProjectDateLabel(input.date),
    cover: input.cover,
    coverAlt: input.coverAlt?.trim() || input.title.trim(),
    coverWidth: input.coverWidth || 1200,
    coverHeight: input.coverHeight || 800,
    collaborators: input.collaborators.filter((c) => c.name.trim()),
  };
  store.projects.unshift(project);
  return project;
}

// Slug tidak diubah meski judul berganti supaya tautan tetap stabil.
export function updateProject(
  slug: string,
  input: ProjectInput,
): Project | undefined {
  const idx = store.projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return undefined;
  store.projects[idx] = {
    ...store.projects[idx],
    title: input.title.trim(),
    event: input.event.trim(),
    type: input.type,
    date: input.date,
    dateLabel: toProjectDateLabel(input.date),
    cover: input.cover,
    coverAlt: input.coverAlt?.trim() || input.title.trim(),
    coverWidth: input.coverWidth || store.projects[idx].coverWidth,
    coverHeight: input.coverHeight || store.projects[idx].coverHeight,
    collaborators: input.collaborators.filter((c) => c.name.trim()),
  };
  return store.projects[idx];
}

export function deleteProject(slug: string): boolean {
  const idx = store.projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return false;
  store.projects.splice(idx, 1);
  return true;
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
