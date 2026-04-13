import { success, error, getAuthUser } from "@/lib/auth";
import { getRestaurantById, getCategoriesByRestaurant, getItemsByRestaurant } from "@/lib/db";
import type { CategoryWithItems } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { restaurantId } = await params;
  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) return error("Restaurant not found", 404);
  if (restaurant.owner_id !== user.sub) return error("Forbidden", 403);

  const cats = getCategoriesByRestaurant(restaurantId);
  const items = getItemsByRestaurant(restaurantId);

  const categories: CategoryWithItems[] = cats
    .filter((c) => c.is_visible)
    .map((c) => ({
      ...c,
      items: items.filter((i) => i.category_id === c.id),
    }));

  return success({ restaurant, categories });
}
