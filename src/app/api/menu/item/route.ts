import { success, error, getAuthUser } from "@/lib/auth";
import { createItem, getRestaurantById, getItemsByRestaurant } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  try {
    const body = await request.json();
    const { restaurant_id, category_id, name, price, description, is_veg, media_url, media_type } = body;

    if (!restaurant_id || !category_id || !name || price == null)
      return error("Missing required fields");

    const restaurant = getRestaurantById(restaurant_id);
    if (!restaurant) return error("Restaurant not found", 404);
    if (restaurant.owner_id !== user.sub) return error("Forbidden", 403);
    if (!restaurant.is_approved) return error("Not approved yet", 403);

    const sortOrder = getItemsByRestaurant(restaurant_id).length;
    const id = crypto.randomUUID();
    const now = Date.now();

    const item = createItem({
      id,
      category_id,
      restaurant_id,
      name,
      description: description || null,
      price: parseFloat(price),
      is_veg: is_veg ?? 1,
      is_available: 1,
      is_featured: 0,
      media_type: media_url ? (media_type || "image") : null,
      media_url: media_url || null,
      media_thumbnail: null,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    });

    return success(item, 201);
  } catch (err) {
    console.error("Create item error:", err);
    return error("Failed to create item", 500);
  }
}
