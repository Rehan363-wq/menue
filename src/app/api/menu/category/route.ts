import { success, error, getAuthUser } from "@/lib/auth";
import { createCategory, getCategoriesByRestaurant, getRestaurantById } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  try {
    const { restaurant_id, name } = await request.json();
    if (!restaurant_id || !name) return error("restaurant_id and name required");

    const restaurant = getRestaurantById(restaurant_id);
    if (!restaurant) return error("Restaurant not found", 404);
    if (restaurant.owner_id !== user.sub) return error("Forbidden", 403);
    if (!restaurant.is_approved) return error("Not approved yet", 403);

    const sortOrder = getCategoriesByRestaurant(restaurant_id).length;
    const id = crypto.randomUUID();

    const category = createCategory({
      id,
      restaurant_id,
      name,
      description: null,
      sort_order: sortOrder,
      is_visible: 1,
      created_at: Date.now(),
    });

    return success(category, 201);
  } catch (err) {
    console.error("Create category error:", err);
    return error("Failed to create category", 500);
  }
}
