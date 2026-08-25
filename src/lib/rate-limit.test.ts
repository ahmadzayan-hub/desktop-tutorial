import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimitStore } from "./rate-limit";

describe("rateLimit (fixed window)", () => {
  beforeEach(() => __resetRateLimitStore());

  it("allows requests up to the limit within a window", () => {
    const t0 = 1_000_000;
    const r1 = rateLimit("k", 3, 1000, t0);
    const r2 = rateLimit("k", 3, 1000, t0 + 100);
    const r3 = rateLimit("k", 3, 1000, t0 + 200);
    expect([r1.allowed, r2.allowed, r3.allowed]).toEqual([true, true, true]);
    expect(r3.remaining).toBe(0);
  });

  it("blocks the request that exceeds the limit", () => {
    const t0 = 2_000_000;
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 1000, t0 + i);
    const blocked = rateLimit("k", 3, 1000, t0 + 4);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const t0 = 3_000_000;
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 1000, t0);
    expect(rateLimit("k", 3, 1000, t0 + 500).allowed).toBe(false); // still in window
    expect(rateLimit("k", 3, 1000, t0 + 1000).allowed).toBe(true); // window elapsed
  });

  it("keeps separate buckets per key", () => {
    const t0 = 4_000_000;
    for (let i = 0; i < 3; i++) rateLimit("a", 3, 1000, t0);
    expect(rateLimit("a", 3, 1000, t0).allowed).toBe(false);
    expect(rateLimit("b", 3, 1000, t0).allowed).toBe(true); // independent
  });
});
