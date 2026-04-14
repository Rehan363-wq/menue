// POST /api/admin/login — Server-side admin credential verification
import { error } from "@/lib/auth";
import { verifyPassword } from "@/lib/hash";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function POST(request: Request) {
  // Rate limit: 3 admin login attempts per 15 minutes per IP
  const ip = getClientIP(request);
  const rl = checkRateLimit(`admin-login:${ip}`, 3, 15 * 60 * 1000);
  if (rl.limited) {
    return error(`Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`, 429);
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !ADMIN_SECRET) {
    console.error("Admin env variables not configured: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_SECRET");
    return error("Admin system not configured", 500);
  }

  try {
    const { email, password } = await request.json();
    if (!email || !password) return error("Email and password required");

    // Verify credentials
    if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
      return error("Invalid admin credentials", 401);
    }

    const valid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!valid) {
      return error("Invalid admin credentials", 401);
    }

    // Return the admin secret for subsequent API calls
    return Response.json({
      success: true,
      data: { secret: ADMIN_SECRET },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return error("Login failed", 500);
  }
}
