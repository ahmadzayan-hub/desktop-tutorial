/**
 * Sliding-window rate limiter — in-process (no external dependency).
 *
 * Works well during warm Vercel instances. On cold starts the window resets,
 * which is a known trade-off: this provides meaningful protection against
 * sustained abuse without requiring Redis or additional infrastructure.
 *
 * To upgrade to persistent rate limiting: swap the Map for Upstash Redis
 * with the same interface — the call sites stay identical.
 */

interface Window {
  count: number;
  resetsAt: number; // epoch ms
}

const store = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetsAt: number;
}

/**
 * Check and increment the rate limit for a given key.
 *
 * @param key     Unique bucket key (e.g. `ip:route`).
 * @param limit   Max requests per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let window = store.get(key);

  if (!window || now >= window.resetsAt) {
    window = { count: 0, resetsAt: now + windowMs };
    store.set(key, window);
  }

  window.count += 1;
  const remaining = Math.max(0, limit - window.count);
  const allowed = window.count <= limit;

  // Prune stale keys periodically to prevent memory growth
  if (store.size > 10_000) {
    for (const [k, v] of store) {
      if (now >= v.resetsAt) store.delete(k);
    }
  }

  return { allowed, remaining, resetsAt: window.resetsAt };
}

/** Standard rate-limit response headers. */
export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetsAt / 1000))
  };
}
