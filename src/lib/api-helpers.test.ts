import { describe, it, expect, vi, beforeEach } from "vitest";

// Control isSupabaseConfigured() per-test for safeRoute.
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: vi.fn(() => true) }));

import { handleError, safeRoute } from "./api-helpers";
import { LlmUnreachableError } from "@/lib/llm/ollama";
import { isSupabaseConfigured } from "@/lib/env";

const cfg = isSupabaseConfigured as unknown as ReturnType<typeof vi.fn>;

describe("handleError", () => {
  it("maps LlmUnreachableError to a 200 unavailable envelope", async () => {
    const res = handleError(new LlmUnreachableError("http://localhost:11434"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.unavailable).toBe(true);
    expect(body.reason).toBe("llm_unreachable");
  });

  it("maps 'Supabase env not configured' to a 200 unavailable envelope", async () => {
    const res = handleError(new Error("Supabase env not configured"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.unavailable).toBe(true);
    expect(body.reason).toBe("backend_not_configured");
  });

  it("returns a generic 500 that does NOT leak the internal error message", async () => {
    const res = handleError(new Error("DB password=hunter2 at pg://internal-host"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("internal");
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("hunter2");
    expect(serialized).not.toContain("pg://internal-host");
  });
});

describe("safeRoute", () => {
  beforeEach(() => cfg.mockReturnValue(true));

  it("short-circuits to a 200 unavailable envelope when the backend is not configured", async () => {
    cfg.mockReturnValue(false);
    const handler = vi.fn();
    const res = await safeRoute(handler)();
    expect(res.status).toBe(200);
    expect(handler).not.toHaveBeenCalled();
    expect((await res.json()).unavailable).toBe(true);
  });

  it("passes through the handler's response when configured", async () => {
    const { NextResponse } = await import("next/server");
    const handler = vi.fn(async () => NextResponse.json({ ok: true }, { status: 201 }));
    const res = await safeRoute(handler)();
    expect(handler).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
  });

  it("catches a thrown error and returns a generic 500 with no message leak", async () => {
    const handler = vi.fn(async () => {
      throw new Error("secret-boom internal detail");
    });
    const res = await safeRoute(handler)();
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret-boom");
  });
});
