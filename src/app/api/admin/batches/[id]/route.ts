import { updateBatch } from "@/server/db/batches";
import type { BatchInput } from "@/store/api/dashboardApi";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const updated = await updateBatch(id, body);
  if (!updated) {
    return Response.json({ message: "Batch tidak ditemukan." }, { status: 404 });
  }
  return Response.json(updated);
}
