import { incrementScanCount, logAnalyticsEvent } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  incrementScanCount(restaurantId);

  // Log analytics event
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const visitorHash = await hashString(ip);

  logAnalyticsEvent({
    id: crypto.randomUUID(),
    restaurant_id: restaurantId,
    event_type: "qr_scan",
    item_id: null,
    visitor_hash: visitorHash,
    created_at: Date.now(),
  });

  return Response.json({ success: true });
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
