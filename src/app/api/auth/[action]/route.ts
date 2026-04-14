import { hashPassword, verifyPassword } from "@/lib/hash";
import { signJWT } from "@/lib/jwt";
import { success, error, successWithCookie, validateEmail, validatePassword } from "@/lib/auth";
import { getOwnerByEmail, createOwner } from "@/lib/db";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === "register") return handleRegister(request);
  if (action === "login") return handleLogin(request);
  if (action === "verify") return handleVerify(request);
  return error("Invalid action", 404);
}

async function handleRegister(request: Request) {
  // Rate limit: 3 registrations per 30 minutes per IP
  const ip = getClientIP(request);
  const rl = checkRateLimit(`register:${ip}`, 3, 30 * 60 * 1000);
  if (rl.limited) {
    return error(`Too many registration attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`, 429);
  }

  try {
    const { name, email, phone, address, password } = await request.json();
    if (!name || !email || !phone || !address || !password) return error("All fields required");
    if (!validateEmail(email)) return error("Invalid email");
    if (!validatePassword(password)) return error("Password must be 8+ chars with 1 uppercase and 1 number");

    const existing = getOwnerByEmail(email);
    if (existing) return error("Email already registered", 409);

    const id = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = Date.now();
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    console.log(`[DEV OTP] Verification code for ${email}: ${verificationCode}`); // For testing

    createOwner({
      id,
      name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password: hashedPassword,
      email_verified: 0,
      verification_code: verificationCode,
      created_at: now,
      updated_at: now,
    });

    try {
      await resend.emails.send({
        from: 'MenuQR Setup <onboarding@resend.dev>',
        to: email.toLowerCase().trim(),
        subject: 'Verify your MenuQR Account',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #fff; text-align: center; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-top: 4px solid #FF6B35; border-radius: 8px;">
            <p style="font-size: 24px; margin-bottom: 0;">🍽️</p>
            <h2 style="color: #FF6B35; font-size: 22px; margin-top: 10px;">Welcome to MenuQR!</h2>
            <p style="color: #475569; font-size: 15px; margin-bottom: 25px;">Here is your verification code to access your dashboard:</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; display: inline-block;">
               <strong style="font-size: 28px; letter-spacing: 4px; color: #0f172a;">${verificationCode}</strong>
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      });
    } catch (e) {
      console.error("Failed to send Resend email:", e);
    }

    return success({ requires_verification: true, email: email.toLowerCase().trim(), message: "Account created. Please check your email for the OTP." }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return error("Registration failed", 500);
  }
}

async function handleLogin(request: Request) {
  // Rate limit: 5 login attempts per 15 minutes per IP
  const ip = getClientIP(request);
  const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (rl.limited) {
    return error(`Too many login attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`, 429);
  }

  try {
    const { email, password } = await request.json();
    if (!email || !password) return error("Email and password required");

    const owner = getOwnerByEmail(email.toLowerCase().trim());
    if (!owner) return error("Invalid credentials", 401);

    const valid = await verifyPassword(password, owner.password);
    if (!valid) return error("Invalid credentials", 401);

    if (owner.email_verified === 0) {
       return success({ requires_verification: true, email: owner.email, message: "Please verify your email" }, 200);
    }

    const token = await signJWT({
      sub: owner.id,
      email: owner.email,
      name: owner.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });

    // Set httpOnly cookie instead of returning token in body
    return successWithCookie(
      { user: { id: owner.id, name: owner.name, email: owner.email } },
      token
    );
  } catch (err) {
    console.error("Login error:", err);
    return error("Login failed", 500);
  }
}

async function handleVerify(request: Request) {
  // Rate limit: 5 verify attempts per 15 minutes per IP
  const ip = getClientIP(request);
  const rl = checkRateLimit(`verify:${ip}`, 5, 15 * 60 * 1000);
  if (rl.limited) {
    return error(`Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`, 429);
  }

  try {
    const { email, code } = await request.json();
    if (!email || !code) return error("Email and code required");

    const owner = getOwnerByEmail(email.toLowerCase().trim());
    if (!owner) return error("Owner not found", 404);

    if (owner.email_verified === 1) return error("Already verified", 400);

    // Strict code verification — no dev bypass in production
    if (owner.verification_code !== code) {
      return error("Invalid verification code", 401);
    }

    // Update in DB
    const { updateOwner } = await import("@/lib/db");
    updateOwner(owner.id, { email_verified: 1, verification_code: null });

    // Sign JWT and set cookie
    const token = await signJWT({
      sub: owner.id,
      email: owner.email,
      name: owner.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });

    return successWithCookie(
      { user: { id: owner.id, name: owner.name, email: owner.email } },
      token
    );
  } catch (err) {
    console.error("Verify error:", err);
    return error("Verification failed", 500);
  }
}
