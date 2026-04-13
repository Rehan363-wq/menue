import { incrementScanCount } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  incrementScanCount(restaurantId);
  return Response.json({ success: true });
}
