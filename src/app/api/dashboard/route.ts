import { getDashboard } from "@/server/db/dashboard";
import type { DashboardSummary } from "@/store/api/dashboardApi";

// Dashboard milik user yang login (per-user, dari MySQL). Jangan cache.
export const dynamic = "force-dynamic";

const EMPTY: DashboardSummary = {
  greeting: { name: "", subtitle: "Select the desired submission and track its status" },
  applications: [],
  classes: [],
};

export async function GET(request: Request) {
  const userId = Number(new URL(request.url).searchParams.get("userId"));
  if (!Number.isInteger(userId) || userId <= 0) {
    return Response.json(EMPTY);
  }
  return Response.json(await getDashboard(userId));
}
