import { createBatch } from "@/server/db/batches";
import type { BatchInput } from "@/store/api/dashboardApi";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as BatchInput;
  if (
    !body.namaBatch?.trim() ||
    !body.kuota ||
    !body.tglMulai ||
    !body.tglBerakhir
  ) {
    return Response.json(
      { message: "Nama, kuota, dan tanggal wajib diisi." },
      { status: 422 },
    );
  }
  const created = await createBatch(body);
  return Response.json(created, { status: 201 });
}
