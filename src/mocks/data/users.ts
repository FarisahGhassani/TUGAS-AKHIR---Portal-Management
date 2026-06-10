import type { AuthUser } from "@/store/api/authApi";

export type StoredUser = AuthUser & { password: string; createdAt: string };

export const seedUsers: StoredUser[] = [
  {
    id: "u-admin-01",
    name: "Vivienne Marchand",
    email: "admin@portalmanagement.id",
    password: "portal2026",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    createdAt: "2025-09-01T08:00:00.000Z",
  },
  {
    id: "u-talent-01",
    name: "Aria Ozemir",
    email: "aria@portalmanagement.id",
    password: "portal2026",
    role: "talent",
    avatar:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80",
    createdAt: "2025-09-01T08:00:00.000Z",
  },
  {
    id: "u-client-01",
    name: "Lukas Beaumont",
    email: "client@portalmanagement.id",
    password: "portal2026",
    role: "client",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    createdAt: "2025-09-01T08:00:00.000Z",
  },
];

export function findUserByEmail(email: string) {
  return seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function addUser(user: StoredUser) {
  seedUsers.push(user);
}
