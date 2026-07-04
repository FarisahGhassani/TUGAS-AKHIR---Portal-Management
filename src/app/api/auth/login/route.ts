import { verifyCredentials } from "@/server/users";
import type { AuthResponse, LoginRequest } from "@/store/api/authApi";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LoginRequest>;

  if (!body.email || !body.password) {
    return Response.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await verifyCredentials(body.email, body.password);
  if (!user) {
    return Response.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const response: AuthResponse = { user, token: `mock-token-${user.id}` };
  return Response.json(response);
}
