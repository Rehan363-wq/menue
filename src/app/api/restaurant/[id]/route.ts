import { success, error, getAuthUser } from "@/lib/auth";
import { getRestaurantById, updateRestaurant } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const restaurant = getRestaurantById(id);
  if (!restaurant) return error("Not found", 404);
  if (restaurant.owner_id !== user.sub) return error("Forbidden", 403);

  return success(restaurant);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const restaurant = getRestaurantById(id);
  if (!restaurant) return error("Not found", 404);
  if (restaurant.owner_id !== user.sub) return error("Forbidden", 403);
  if (!restaurant.is_approved) return error("Restaurant not approved yet", 403);

  try {
    const body = await request.json();
    const updated = updateRestaurant(id, {
      name: body.name ?? restaurant.name,
      description: body.description ?? restaurant.description,
      address: body.address ?? restaurant.address,
      phone: body.phone ?? restaurant.phone,
      bg_image_url: body.bg_image_url ?? restaurant.bg_image_url,
      theme_color: body.theme_color ?? restaurant.theme_color,
      font_family: body.font_family ?? restaurant.font_family,
      logo_url: body.logo_url ?? restaurant.logo_url,
    });

    return success(updated);
  } catch (err) {
    console.error("Update restaurant error:", err);
    return error("Update failed", 500);
  }
}
