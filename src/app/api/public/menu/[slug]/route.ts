import { success, error } from "@/lib/auth";
import { getRestaurantBySlug, getCategoriesByRestaurant, getItemsByRestaurant, logAnalyticsEvent } from "@/lib/db";
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

  // Log item_view analytics event
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const visitorHash = await hashString(ip);

  logAnalyticsEvent({
    id: crypto.randomUUID(),
    restaurant_id: restaurant.id,
    event_type: "item_view",
    item_id: null,
    visitor_hash: visitorHash,
    created_at: Date.now(),
  });

  return success({ restaurant, categories });
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
