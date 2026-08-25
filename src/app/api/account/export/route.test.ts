import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/db/supabase-server", () => ({ requireUser: vi.fn() }));
import { GET } from "./route";
import { requireUser } from "@/lib/db/supabase-server";

const requireUserMock = requireUser as unknown as ReturnType<typeof vi.fn>;

// Records every .eq(column, value) so we can assert all queries are scoped to
// the authenticated user's id (no cross-tenant export).
function makeSupabase() {
  const eqCalls: Array<[string, unknown]> = [];
  const supabase = {
    from() {
      return {
        select() {
          return {
            eq: async (col: string, val: unknown) => {
              eqCalls.push([col, val]);
              return { data: [] };
            },
          };
        },
      };
    },
  };
  return { supabase, eqCalls };
}

describe("GET /api/account/export — GDPR export authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an unauthenticated caller with 401", async () => {
    requireUserMock.mockResolvedValue({
      user: null,
      supabase: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    expect((await GET()).status).toBe(401);
  });

  it("scopes every exported table to the authenticated user's id", async () => {
    const { supabase, eqCalls } = makeSupabase();
    requireUserMock.mockResolvedValue({ user: { id: "user-abc" }, supabase, unauthorized: null });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment");

    const body = JSON.parse(await res.text());
    expect(body.user_id).toBe("user-abc");
    // Every query filtered on user_id = the caller — never another tenant.
    expect(eqCalls.length).toBeGreaterThan(0);
    expect(eqCalls.every(([col, val]) => col === "user_id" && val === "user-abc")).toBe(true);
  });
});
