import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// Authorization backbone for the destructive GDPR endpoint is mocked so we can
// assert the route (a) refuses unauthenticated callers before any DB access and
// (b) scopes the deletion request to the *authenticated* user only.
vi.mock("@/lib/db/supabase-server", () => ({
  requireUser: vi.fn(),
  createServiceClient: vi.fn(),
}));

import { POST } from "./route";
import { requireUser, createServiceClient } from "@/lib/db/supabase-server";

const requireUserMock = requireUser as unknown as ReturnType<typeof vi.fn>;
const createServiceClientMock = createServiceClient as unknown as ReturnType<typeof vi.fn>;

describe("POST /api/account/delete — authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses an unauthenticated caller and never touches the database", async () => {
    requireUserMock.mockResolvedValue({
      user: null,
      unauthorized: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    });

    const res = await POST();
    expect(res.status).toBe(401);
    expect(createServiceClientMock).not.toHaveBeenCalled();
  });

  it("scopes the deletion request to the authenticated user's id", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    createServiceClientMock.mockReturnValue({ from: vi.fn(() => ({ insert })) });
    requireUserMock.mockResolvedValue({ user: { id: "user-123" }, unauthorized: null });

    const res = await POST();
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(insert).toHaveBeenCalledTimes(1);
    const row = insert.mock.calls[0][0];
    expect(row.user_id).toBe("user-123");
    expect(row.status).toBe("pending");
  });
});
