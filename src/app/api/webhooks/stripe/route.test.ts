import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// The webhook must reject any request whose signature does not verify, BEFORE
// touching Stripe or the database. We force constructEvent to throw and assert
// the handler returns 400 without processing the event.
vi.mock("@/lib/stripe/client", () => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(() => {
        throw new Error("signature verification failed");
      }),
    },
  })),
}));
// Guard: the service-role Supabase client must never be constructed on the
// rejection paths. Fail loudly if it is.
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => {
    throw new Error("supabase client must not be created before signature check");
  }),
}));

import { POST } from "./route";

function makeReq(body: string, headers: Record<string, string | null>): NextRequest {
  return {
    text: async () => body,
    headers: { get: (k: string) => headers[k] ?? null },
  } as unknown as NextRequest;
}

describe("POST /api/webhooks/stripe — signature enforcement", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("rejects a request with no stripe-signature header (400)", async () => {
    const res = await POST(makeReq("{}", { "stripe-signature": null }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid signature without processing the event (400)", async () => {
    const res = await POST(makeReq("{}", { "stripe-signature": "t=1,v1=deadbeef" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid signature");
  });
});
