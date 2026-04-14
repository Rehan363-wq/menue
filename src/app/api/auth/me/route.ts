// GET /api/auth/me — Returns current authenticated user from httpOnly cookie
import { getAuthUser, success, error } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return error("Not authenticated", 401);

  return success({
    user: {
      id: user.sub,
      name: user.name,
      email: user.email,
    },
  });
}
