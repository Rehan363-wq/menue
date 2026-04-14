import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { updateOwner, getOwnerById } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJWT(auth);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const owner = getOwnerById(payload.sub);
    if (!owner) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const updated = updateOwner(payload.sub, { name: name.trim() });

    return NextResponse.json({
      success: true,
      data: { name: updated?.name, email: updated?.email },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
