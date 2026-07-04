import { listBatches } from "@/server/db/batches";

// Daftar batch kelas (untuk form pendaftaran kelas & panel admin) — dari MySQL.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listBatches());
}
