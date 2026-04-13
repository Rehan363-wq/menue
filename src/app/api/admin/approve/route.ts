import { success, error } from "@/lib/auth";
import { getRestaurantById, updateRestaurant, getAllRestaurants } from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-change-me";

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
      });
      return success(updated);
    } else if (action === "reject") {
      const updated = updateRestaurant(restaurant_id, {
        approval_status: "rejected",
        is_approved: 0,
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
  return success(all);
}
