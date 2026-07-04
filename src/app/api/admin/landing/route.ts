import { updateLandingContent } from "@/server/db/landing";
import type { LandingContent } from "@/store/api/landingApi";

export const dynamic = "force-dynamic";

// Admin memperbarui konten landing (section yang dikirim ditimpa utuh).
export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<LandingContent>;
  const updated = await updateLandingContent(body);
  return Response.json(updated);
}
