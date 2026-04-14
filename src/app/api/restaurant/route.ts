import { success, error, getAuthUser } from "@/lib/auth";
import {
  getRestaurantsByOwner,
  createRestaurant,
  getRestaurantBySlug,
} from "@/lib/db";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const owned = getRestaurantsByOwner(user.sub);
  return success(owned);
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  try {
    const { name, slug, description, plan_type } = await request.json();
    if (!name || !slug) return error("Name and slug are required");

    const existing = getRestaurantBySlug(slug);
    if (existing) return error("This slug is already taken", 409);

    const id = crypto.randomUUID();
    const now = Date.now();

    const restaurant = createRestaurant({
      id,
      owner_id: user.sub,
      name,
      slug: slug.toLowerCase().trim(),
      description: description || null,
      address: null,
      phone: null,
      bg_image_url: null,
      theme_color: "#FF6B35",
      font_family: "Inter",
      logo_url: null,
      zomato_url: null,
      swiggy_url: null,
      instagram_url: null,
      is_active: 1,
      approval_status: "pending",
      is_approved: 0,
      approved_until: null,
      plan_type: plan_type || "image",
      created_at: now,
      updated_at: now,
    });

    return success(restaurant, 201);
  } catch (err) {
    console.error("Create restaurant error:", err);
    return error("Failed to create restaurant", 500);
  }
}
