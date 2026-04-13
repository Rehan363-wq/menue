import { hashPassword, verifyPassword } from "@/lib/hash";
import { signJWT } from "@/lib/jwt";
import { success, error, validateEmail, validatePassword } from "@/lib/auth";
import { getOwnerByEmail, createOwner } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === "register") return handleRegister(request);
  if (action === "login") return handleLogin(request);
  return error("Invalid action", 404);
}

async function handleRegister(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return error("All fields required");
    if (!validateEmail(email)) return error("Invalid email");
    if (!validatePassword(password)) return error("Password must be 6+ chars");

    const existing = getOwnerByEmail(email);
    if (existing) return error("Email already registered", 409);

    const id = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = Date.now();

    createOwner({
      id,
      name,
      email: email.toLowerCase().trim(),
      phone: null,
      password: hashedPassword,
      created_at: now,
      updated_at: now,
    });

    return success({ message: "Account created successfully" }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return error("Registration failed", 500);
  }
}

async function handleLogin(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return error("Email and password required");

    const owner = getOwnerByEmail(email.toLowerCase().trim());
    if (!owner) return error("Invalid credentials", 401);

    const valid = await verifyPassword(password, owner.password);
    if (!valid) return error("Invalid credentials", 401);

    const token = await signJWT({
      sub: owner.id,
      email: owner.email,
      name: owner.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });

    return success({
      token,
      user: { id: owner.id, name: owner.name, email: owner.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return error("Login failed", 500);
  }
}
