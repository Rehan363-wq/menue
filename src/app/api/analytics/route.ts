import { success, error, getAuthUser } from "@/lib/auth";
import {
  getAnalyticsEventsByType,
  getUniqueVisitorCount,
  getPerDayCounts,
  getTopItemsByRating,
  getRestaurantsByOwner,
} from "@/lib/db";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return error("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");
  const days = parseInt(searchParams.get("days") || "12", 10);

  if (!restaurantId) return error("restaurantId is required", 400);

  // Verify ownership
  const owned = getRestaurantsByOwner(user.sub);
  if (!owned.find(r => r.id === restaurantId)) {
    return error("Forbidden", 403);
  }

  const now = Date.now();
  const fromTimestamp = now - days * 86400000;

  const qrScans = getAnalyticsEventsByType(restaurantId, "qr_scan", fromTimestamp).length;
  const itemViews = getAnalyticsEventsByType(restaurantId, "item_view", fromTimestamp).length;
  const uniqueVisitors = getUniqueVisitorCount(restaurantId, fromTimestamp);
  const perDayCounts = getPerDayCounts(restaurantId, days);
  const topItems = getTopItemsByRating(restaurantId, 5);

  // Total counts (all time)
  const totalQrScans = getAnalyticsEventsByType(restaurantId, "qr_scan").length;
  const totalItemViews = getAnalyticsEventsByType(restaurantId, "item_view").length;
  const totalUniqueVisitors = getUniqueVisitorCount(restaurantId);

  return success({
    period: { days, from: fromTimestamp, to: now },
    stats: {
      qrScans: totalQrScans,
      itemViews: totalItemViews,
      uniqueVisitors: totalUniqueVisitors,
      periodQrScans: qrScans,
      periodItemViews: itemViews,
      periodUniqueVisitors: uniqueVisitors,
    },
    chartData: perDayCounts,
    topItems: topItems.map(item => ({
      id: item.id,
      name: item.name,
      rating_score: item.rating_score,
      rating_count: item.rating_count,
      price: item.price,
    })),
  });
}
