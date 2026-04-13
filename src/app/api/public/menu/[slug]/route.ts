import { success, error } from "@/lib/auth";
import { getRestaurantBySlug, getCategoriesByRestaurant, getItemsByRestaurant } from "@/lib/db";
import type { CategoryWithItems } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.is_active || !restaurant.is_approved)
    return error("Restaurant not found", 404);

  const cats = getCategoriesByRestaurant(restaurant.id);
  const items = getItemsByRestaurant(restaurant.id);

  const categories: CategoryWithItems[] = cats
    .filter((c) => c.is_visible)
    .map((c) => ({
      ...c,
      items: items.filter((i) => i.category_id === c.id && i.is_available),
    }));

  return success({ restaurant, categories });
}
