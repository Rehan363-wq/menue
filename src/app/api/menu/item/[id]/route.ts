import { success, error, getAuthUser } from "@/lib/auth";
import { getItemById, updateItem, deleteItem, getRestaurantById } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const item = getItemById(id);
  if (!item) return error("Not found", 404);

  const restaurant = getRestaurantById(item.restaurant_id);
  if (!restaurant || restaurant.owner_id !== user.sub) return error("Forbidden", 403);

  try {
    const body = await request.json();
    const updated = updateItem(id, {
      name: body.name ?? item.name,
      price: body.price != null ? parseFloat(body.price) : item.price,
      description: body.description ?? item.description,
      is_veg: body.is_veg ?? item.is_veg,
      media_url: body.media_url ?? item.media_url,
      media_type: body.media_type ?? item.media_type,
    });
    return success(updated);
  } catch (err) {
    console.error("Update item error:", err);
    return error("Update failed", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const item = getItemById(id);
  if (!item) return error("Not found", 404);

  const restaurant = getRestaurantById(item.restaurant_id);
  if (!restaurant || restaurant.owner_id !== user.sub) return error("Forbidden", 403);

  deleteItem(id);
  return success({ deleted: true });
}
