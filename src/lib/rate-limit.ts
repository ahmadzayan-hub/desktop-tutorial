/**
 * Sliding-window rate limiter with two-tier storage:
 *
 *   1. Upstash Redis (persistent) — when UPSTASH_REDIS_REST_URL +
 *      UPSTASH_REDIS_REST_TOKEN are set. Uses the REST API directly (no npm
 *      package), so it works on Edge and Node runtimes without extra deps.
 *
 *   2. In-process Map (ephemeral fallback) — resets on cold starts but
 *      provides meaningful protection during warm instances.
 *
 * Call sites are identical regardless of which tier is active.
 */

// ── In-process fallback ───────────────────────────────────────────────────────

interface Window {
  count: number;
  resetsAt: number; // epoch ms
}

const store = new Map<string, Window>();

function inProcessLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let window = store.get(key);

  if (!window || now >= window.resetsAt) {
    window = { count: 0, resetsAt: now + windowMs };
    store.set(key, window);
  }

  window.count += 1;
  const allowed = window.count <= limit;
  const remaining = Math.max(0, limit - window.count);

  // Prune stale keys to prevent unbounded memory growth
  if (store.size > 10_000) {
    for (const [k, v] of store) {
      if (now >= v.resetsAt) store.delete(k);
    }
  }

  return { allowed, remaining, resetsAt: window.resetsAt };
}

// ── Upstash REST client ───────────────────────────────────────────────────────

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashCmd(...args: (string | number)[]): Promise<number | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/${args.map(encodeURIComponent).join("/")}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      // Short timeout — fall through to in-memory on Redis hiccup
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result: number };
    return json.result ?? null;
  } catch {
    return null;
  }
}

async function upstashLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;

  // INCR then set TTL if this is the first request in the window.
  // Uses two commands (not atomic), which is fine for rate limiting —
  // a tiny over-count on the boundary is acceptable.
  const rk = `rl:${key}`;
  const count = await upstashCmd("INCR", rk);
  if (count === null) return null;

  if (count === 1) {
    // First request in this window — set expiry
    await upstashCmd("EXPIRE", rk, windowSec);
  }

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const resetsAt = Date.now() + windowSec * 1000; // approximate

  return { allowed, remaining, resetsAt };
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetsAt: number; // epoch ms
}

/**
 * Check and increment the rate limit for a given key.
 *
 * @param key       Unique bucket key, e.g. `transcribe:1.2.3.4`
 * @param limit     Max requests allowed per window
 * @param windowMs  Window size in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const windowSec = Math.ceil(windowMs / 1000);
  const result = await upstashLimit(key, limit, windowSec);
  return result ?? inProcessLimit(key, limit, windowMs);
}

/** Standard rate-limit response headers for the client. */
export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetsAt / 1000)),
  };
}
