import { createUser, emailExists } from "@/server/users";
import type { AuthResponse, RegisterRequest } from "@/store/api/authApi";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RegisterRequest>;

  if (!body.name || !body.email || !body.password || !body.role) {
    return Response.json(
      { message: "All fields are required." },
      { status: 400 },
    );
  }

  if (await emailExists(body.email)) {
    return Response.json(
      { message: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const user = await createUser({
    nama: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
  });

  const response: AuthResponse = { user, token: `mock-token-${user.id}` };
  return Response.json(response, { status: 201 });
}
