// src/lib/rate-limit.ts — In-memory sliding window rate limiter

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited.
 * @param key - Unique identifier (e.g., IP + action)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { limited: boolean, remaining: number, retryAfterMs: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  // No entry, or window expired — reset
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  // Within window — increment
  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      limited: true,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  return {
    limited: false,
    remaining: maxRequests - entry.count,
    retryAfterMs: 0,
  };
}

/**
 * Extract client IP from request headers.
 * Works with proxied environments (Cloudflare, Vercel, etc.)
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
