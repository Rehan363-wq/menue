import { success, error } from "@/lib/auth";
import { getRestaurantById, updateRestaurant, getAllRestaurants, getOwnerById, getItemsByRestaurant, deleteRestaurant } from "@/lib/db";
import type { RestaurantWithOwner } from "@/lib/types";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function POST(request: Request) {
  const adminKey = request.headers.get("x-admin-secret");
  if (adminKey !== ADMIN_SECRET) return error("Unauthorized", 401);

  try {
    const { restaurant_id, action } = await request.json();
    if (!restaurant_id || !action)
      return error("restaurant_id and action required");

    const restaurant = getRestaurantById(restaurant_id);
    if (!restaurant) return error("Restaurant not found", 404);

    if (action === "approve") {
      const updated = updateRestaurant(restaurant_id, {
        approval_status: "approved",
        is_approved: 1,
        approved_until: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
      return success(updated);
    } else if (action === "reject") {
      const updated = updateRestaurant(restaurant_id, {
        approval_status: "rejected",
        is_approved: 0,
        approved_until: null,
      });
      return success(updated);
    }

    return error("Invalid action. Use 'approve' or 'reject'.");
  } catch (err) {
    console.error("Admin approve error:", err);
    return error("Operation failed", 500);
  }
}

export async function GET(request: Request) {
  const adminKey = request.headers.get("x-admin-secret");
  if (adminKey !== ADMIN_SECRET) return error("Unauthorized", 401);

  const all = getAllRestaurants();

  // Enrich with owner info and item counts
  const enriched: RestaurantWithOwner[] = all.map(r => {
    const owner = getOwnerById(r.owner_id);
    const items = getItemsByRestaurant(r.id);
    return {
      ...r,
      owner_email: owner?.email,
      owner_name: owner?.name,
      owner_phone: owner?.phone,
      total_items: items.length,
    };
  });

  return success(enriched);
}

export async function DELETE(request: Request) {
  const adminKey = request.headers.get("x-admin-secret");
  if (adminKey !== ADMIN_SECRET) return error("Unauthorized", 401);

  try {
    const { restaurant_id } = await request.json();
    if (!restaurant_id) return error("restaurant_id required");

    const restaurant = getRestaurantById(restaurant_id);
    if (!restaurant) return error("Restaurant not found", 404);

    const deleted = deleteRestaurant(restaurant_id);
    if (deleted) {
      return success({ message: `Restaurant "${restaurant.name}" and all its data permanently deleted.` });
    }
    return error("Failed to delete restaurant", 500);
  } catch (err) {
    console.error("Admin delete restaurant error:", err);
    return error("Delete operation failed", 500);
  }
}
