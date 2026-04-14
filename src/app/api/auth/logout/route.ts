// POST /api/auth/logout — Clears the httpOnly auth cookie
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  return clearAuthCookie();
}
