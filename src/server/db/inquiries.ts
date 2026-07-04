// ---------------------------------------------------------------------------
// Inquiries (client collaboration) — DB-backed (Prisma → MySQL `inquiry_client`).
//
// Menggantikan mock MSW. Bentuk yang dikembalikan TETAP `ClientInquiry` (shape
// RTK). Form publik bisa dikirim tanpa sesi login → idUser dibiarkan null.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type {
  ClientInquiry,
  CreateInquiryRequest,
  InquiryStatus,
} from "@/store/api/inquiryApi";
import type { InquiryClient as PrismaInquiry } from "@prisma/client";

function toISODate(d: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

function toInquiry(row: PrismaInquiry): ClientInquiry {
  return {
    id: String(row.idInquiry),
    namaClient: row.namaClient,
    noTelepon: row.noTelepon,
    judulProject: row.judulProject,
    brand: row.brand ?? undefined,
    jenisJob: row.jenisJob,
    tanggalProject: toISODate(row.tanggalProject),
    tanggalProjectSelesai: toISODate(row.tanggalSelesai),
    modelPilihan: row.modelPilihan ?? undefined,
    catatanClient: row.catatanClient ?? undefined,
    status: row.status,
    catatanAdmin: row.catatanAdmin ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Semua inquiry — dipakai panel admin.
export async function listInquiries(): Promise<ClientInquiry[]> {
  const rows = await prisma.inquiryClient.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toInquiry);
}

// Inquiry milik satu client — dipakai halaman collaboration (akun baru→kosong).
export async function listInquiriesForUser(
  userId: number,
): Promise<ClientInquiry[]> {
  const rows = await prisma.inquiryClient.findMany({
    where: { idUser: userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toInquiry);
}

export async function createInquiry(
  input: CreateInquiryRequest,
  userId?: number,
): Promise<ClientInquiry> {
  const row = await prisma.inquiryClient.create({
    data: {
      idUser: userId ?? null,
      namaClient: input.namaClient.trim(),
      noTelepon: input.noTelepon.trim(),
      judulProject: input.judulProject.trim(),
      brand: input.brand?.trim() || null,
      jenisJob: input.jenisJob.trim(),
      tanggalProject: input.tanggalProject
        ? new Date(input.tanggalProject)
        : null,
      tanggalSelesai: input.tanggalProjectSelesai
        ? new Date(input.tanggalProjectSelesai)
        : null,
      modelPilihan: input.modelPilihan?.trim() || null,
      catatanClient: input.catatanClient?.trim() || null,
      status: "submitted",
    },
  });
  return toInquiry(row);
}

export async function updateInquiry(
  id: string,
  patch: { status?: InquiryStatus; catatanAdmin?: string },
): Promise<ClientInquiry | null> {
  const idInquiry = Number(id);
  if (!Number.isInteger(idInquiry)) return null;
  const existing = await prisma.inquiryClient.findUnique({
    where: { idInquiry },
  });
  if (!existing) return null;
  const row = await prisma.inquiryClient.update({
    where: { idInquiry },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.catatanAdmin !== undefined
        ? { catatanAdmin: patch.catatanAdmin }
        : {}),
    },
  });
  return toInquiry(row);
}
