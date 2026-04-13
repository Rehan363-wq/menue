import { success, error, getAuthUser } from "@/lib/auth";
import { getCategoryById, updateCategory, deleteCategory, getRestaurantById } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const category = getCategoryById(id);
  if (!category) return error("Not found", 404);

  const restaurant = getRestaurantById(category.restaurant_id);
  if (!restaurant || restaurant.owner_id !== user.sub) return error("Forbidden", 403);

  try {
    const body = await request.json();
    const updated = updateCategory(id, {
      name: body.name ?? category.name,
      description: body.description ?? category.description,
      sort_order: body.sort_order ?? category.sort_order,
    });
    return success(updated);
  } catch (err) {
    console.error("Update category error:", err);
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
  const category = getCategoryById(id);
  if (!category) return error("Not found", 404);

  const restaurant = getRestaurantById(category.restaurant_id);
  if (!restaurant || restaurant.owner_id !== user.sub) return error("Forbidden", 403);

  deleteCategory(id);
  return success({ deleted: true });
}
