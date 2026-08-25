// Fixed-window, in-memory rate limiter.
//
// NOTE: on serverless/edge this is BEST-EFFORT — the window is per-instance and
// resets on cold start, so it dampens abuse rather than enforcing a hard global
// cap. For production-grade limits swap `store` for a shared store (Upstash
// Redis / Vercel KV). The interface is kept store-agnostic for that reason.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key       identity of the caller within a bucket (e.g. `auth:1.2.3.4`)
 * @param limit     max requests allowed per window
 * @param windowMs  window length in milliseconds
 * @param now       injectable clock (for deterministic tests)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Test-only: clear all buckets. */
export function __resetRateLimitStore(): void {
  store.clear();
}
