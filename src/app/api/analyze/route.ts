// POST /api/analyze · runs the AI analysis + guardrail pipeline.
// Body: { customerMessage, context, images?, claimEvidenceVerified?, isCourierPromise?, isSensitiveAction? }
// Returns the structured AnalysisOutput + guardrail findings for operator review.

import { NextRequest, NextResponse } from "next/server";
import { analyzeConversation, AnalyzeInput } from "@/lib/ai/analyze";
import { hasSupabaseEnv, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Payload cap: this endpoint bills against a paid AI provider, so refuse
// oversized bodies before doing any expensive work.
const MAX_BODY_BYTES = 32 * 1024;

// Allowed request origins in production. The console is same-origin only:
// no third-party site should be able to call the AI provider on our tab.
function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // server-to-server or non-browser client
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

// In-memory best-effort throttle. Not shared across serverless instances on
// Vercel, but still blocks the trivial burst-from-one-warm-container case.
// Persistent enforcement should move to Vercel KV / Upstash Redis; see
// SECURITY.md priority queue item 2.
const HITS = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const LIMIT_PER_MIN = 20;
function throttled(id: string): boolean {
  const now = Date.now();
  const rec = HITS.get(id);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    HITS.set(id, { count: 1, windowStart: now });
    return false;
  }
  rec.count += 1;
  return rec.count > LIMIT_PER_MIN;
}

export async function POST(req: NextRequest) {
  // 1) Origin check · block cross-site invocation of a paid endpoint.
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  // 2) Auth check · when Supabase is configured, require a signed-in operator.
  //    In demo mode (no Supabase env), fall through so the sample UX still works.
  let userKey = "anonymous";
  if (hasSupabaseEnv()) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userKey = user.id;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 3) Size cap.
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // 4) Rate-limit (best-effort, per user or IP in demo mode).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(`${userKey}:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // 5) Parse and validate body.
  let body: AnalyzeInput;
  try {
    body = (await req.json()) as AnalyzeInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.customerMessage || !body?.context) {
    return NextResponse.json(
      { error: "customerMessage and context are required" },
      { status: 400 }
    );
  }

  // Cap individual field sizes too · a tiny content-length header can still
  // wrap a nested payload that expands during processing.
  if (body.customerMessage.length > 4000) {
    return NextResponse.json({ error: "customerMessage too long" }, { status: 413 });
  }

  try {
    const result = await analyzeConversation(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
