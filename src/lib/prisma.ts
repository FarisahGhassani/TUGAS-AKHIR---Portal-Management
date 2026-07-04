// Prisma Client singleton.
//
// Di Next.js (dev mode) modul bisa di-reload berkali-kali oleh HMR. Tanpa
// singleton ini, setiap reload akan membuat instance PrismaClient baru dan
// menumpuk koneksi ke MySQL hingga "too many connections". Pola di bawah
// menyimpan satu instance di globalThis dan memakai ulang instance itu.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
