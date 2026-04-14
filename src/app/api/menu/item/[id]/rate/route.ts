import { success, error } from "@/lib/auth";
import { getItemById, updateItem } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return error("Valid rating between 1 and 5 is required", 400);
    }

    const item = getItemById(id);
    if (!item) return error("Menu item not found", 404);

    // Calculate new rating average
    const newCount = item.rating_count + 1;
    const currentSum = item.rating_score * item.rating_count;
    const newScore = (currentSum + rating) / newCount;

    const updated = updateItem(id, {
      rating_count: newCount,
      rating_score: newScore,
    });

    return success(updated);
  } catch (err) {
    console.error("Rate item error:", err);
    return error("Failed to submit rating", 500);
  }
}
