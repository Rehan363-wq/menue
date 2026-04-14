import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import {
  getRestaurantsByOwner,
  getItemsByRestaurant,
} from "@/lib/db";
import type { MenuItem } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJWT(auth);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const restaurants = getRestaurantsByOwner(payload.sub);
    
    // Collect all items with ratings across all restaurants
    const allRatedItems: (MenuItem & { restaurantName: string })[] = [];
    let totalRatingSum = 0;
    let totalRatingCount = 0;

    for (const rest of restaurants) {
      const items = getItemsByRestaurant(rest.id);
      for (const item of items) {
        if (item.rating_count > 0) {
          allRatedItems.push({ ...item, restaurantName: rest.name });
          totalRatingSum += item.rating_score * item.rating_count;
          totalRatingCount += item.rating_count;
        }
      }
    }

    // Calculate aggregate stats
    const avgRating = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;
    const positiveCount = allRatedItems.filter(i => i.rating_score >= 3.5).reduce((sum, i) => sum + i.rating_count, 0);
    const positivePercent = totalRatingCount > 0 ? Math.round((positiveCount / totalRatingCount) * 100) : 0;

    // Find fan favorite (highest rated item)
    const fanFavorite = allRatedItems.length > 0
      ? allRatedItems.sort((a, b) => b.rating_score - a.rating_score)[0]
      : null;

    // Build recent feedback list from rated items (sorted by updated_at desc)
    const recentFeedback = allRatedItems
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        itemName: item.name,
        restaurantName: item.restaurantName,
        ratingScore: item.rating_score,
        ratingCount: item.rating_count,
        updatedAt: item.updated_at,
      }));

    return NextResponse.json({
      success: true,
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings: totalRatingCount,
        positivePercent,
        fanFavorite: fanFavorite ? {
          name: fanFavorite.name,
          restaurantName: fanFavorite.restaurantName,
          rating: fanFavorite.rating_score,
        } : null,
        recentFeedback,
      },
    });
  } catch (err) {
    console.error("Customer feedback error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
