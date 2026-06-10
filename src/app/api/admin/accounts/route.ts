import { listAccounts } from "@/server/store";
import type { AdminAccountsResponse } from "@/store/api/adminApi";

// Reads live in-memory state, so it must never be cached.
export const dynamic = "force-dynamic";

export async function GET() {
  const response: AdminAccountsResponse = listAccounts();
  return Response.json(response);
}
