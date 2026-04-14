import { success, error } from "@/lib/auth";
import { getRestaurantById, getCategoriesByRestaurant, getItemsByRestaurant, getOwnerById } from "@/lib/db";
import type { CategoryWithItems } from "@/lib/types";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-change-me";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminKey = request.headers.get("x-admin-secret");
  if (adminKey !== ADMIN_SECRET) return error("Unauthorized", 401);

  const { id } = await params;

  try {
    const restaurant = getRestaurantById(id);
    if (!restaurant) return error("Restaurant not found", 404);

    const owner = getOwnerById(restaurant.owner_id);
    const cats = getCategoriesByRestaurant(id);
    const items = getItemsByRestaurant(id);

    const categories: CategoryWithItems[] = cats.map((c) => ({
      ...c,
      // Admin sees all items, regardless of visibility, to audit properly
      items: items.filter((i) => i.category_id === c.id),
    }));

    return success({
      restaurant: {
        ...restaurant,
        owner_email: owner?.email,
        owner_name: owner?.name,
        owner_phone: owner?.phone,
        total_items: items.length,
      },
      categories,
    });
  } catch (err) {
    console.error("Admin fetch restaurant error:", err);
    return error("Failed to fetch restaurant preview", 500);
  }
}
