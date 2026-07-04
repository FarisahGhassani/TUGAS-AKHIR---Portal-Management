import {
  listInquiries,
  listInquiriesForUser,
  createInquiry,
} from "@/server/db/inquiries";
import type { CreateInquiryRequest } from "@/store/api/inquiryApi";

// Client collaboration — riwayat inquiry (client memantau, admin menindak).
// Kini DB-backed (Prisma → MySQL `inquiry_client`).
export const dynamic = "force-dynamic";

// ?userId=X → inquiry milik client itu (collaboration). Tanpa param → semua
// inquiry (panel admin).
export async function GET(request: Request) {
  const userIdParam = new URL(request.url).searchParams.get("userId");
  if (userIdParam) {
    const userId = Number(userIdParam);
    if (!Number.isInteger(userId) || userId <= 0) return Response.json([]);
    return Response.json(await listInquiriesForUser(userId));
  }
  return Response.json(await listInquiries());
}

// Mengajukan project brief baru — milik client yang login (status awal baru).
export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
  } & CreateInquiryRequest;
  if (
    !body.namaClient?.trim() ||
    !body.noTelepon?.trim() ||
    !body.judulProject?.trim() ||
    !body.jenisJob?.trim()
  ) {
    return Response.json(
      { message: "Phone number, project title, and job type are required." },
      { status: 422 },
    );
  }
  const userId = Number(body.userId);
  const created = await createInquiry(
    body,
    Number.isInteger(userId) && userId > 0 ? userId : undefined,
  );
  return Response.json(created, { status: 201 });
}
