import { getAccountActivity, updateAccountRole } from "@/server/users";
import type { EditableRole } from "@/store/api/adminApi";

// Dibaca/ditulis langsung ke tabel `user` (MySQL via Prisma) — jangan cache.
export const dynamic = "force-dynamic";

const EDITABLE_ROLES: EditableRole[] = ["client", "talent"];

function isEditableRole(value: unknown): value is EditableRole {
  return (
    typeof value === "string" &&
    (EDITABLE_ROLES as string[]).includes(value)
  );
}

// Detail aktivitas akun (pendaftaran + inquiry miliknya) untuk modal admin.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const activity = await getAccountActivity(id);
  if (!activity) {
    return Response.json(
      { message: "Akun tidak ditemukan." },
      { status: 404 },
    );
  }
  return Response.json(activity);
}

// Ubah peran akun (client ↔ talent). Peran admin tidak boleh diubah.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { role?: unknown };
  if (!isEditableRole(body.role)) {
    return Response.json(
      { message: "Peran hanya boleh client atau talent." },
      { status: 422 },
    );
  }
  const updated = await updateAccountRole(id, body.role);
  if (!updated) {
    return Response.json(
      { message: "Akun tidak ditemukan atau perannya tidak dapat diubah." },
      { status: 404 },
    );
  }
  return Response.json(updated);
}
