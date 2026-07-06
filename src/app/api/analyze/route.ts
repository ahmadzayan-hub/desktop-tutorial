// POST /api/analyze · runs the AI analysis + guardrail pipeline.
// Body: { customerMessage, context, images?, claimEvidenceVerified?, isCourierPromise?, isSensitiveAction? }
// Returns the structured AnalysisOutput + guardrail findings for operator review.
//
// Hardened per THREAT_MODEL.md §3.2:
//   · request body capped at MAX_BODY_BYTES (denial of wallet)
//   · at most MAX_IMAGES images, each <= MAX_IMAGE_B64 bytes (denial of wallet)
//   · promptOverrides keys whitelisted to the PromptKey union (elevation of privilege)

import { NextRequest, NextResponse } from "next/server";
import { analyzeConversation, AnalyzeInput } from "@/lib/ai/analyze";
import { DEFAULT_PROMPTS, type PromptKey } from "@/lib/ai/prompts";

export const runtime = "nodejs";

const MAX_BODY_BYTES     = 1_048_576;   // 1 MB total request
const MAX_MESSAGE_CHARS  = 8_000;       // customer message
const MAX_IMAGES         = 3;
const MAX_IMAGE_B64      = 2_800_000;   // ~2 MB decoded per image
const MAX_OVERRIDE_CHARS = 20_000;      // per-prompt override

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;

  const customerMessage = typeof raw.customerMessage === "string" ? raw.customerMessage : "";
  if (!customerMessage || !raw.context) {
    return NextResponse.json({ error: "customerMessage and context are required" }, { status: 400 });
  }
  if (customerMessage.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: "customerMessage too long" }, { status: 413 });
  }

  const images = Array.isArray(raw.images) ? raw.images.slice(0, MAX_IMAGES) : undefined;
  if (images) {
    for (const img of images) {
      if (!img || typeof img !== "object") {
        return NextResponse.json({ error: "Invalid image entry" }, { status: 400 });
      }
      const b64 = (img as { dataBase64?: unknown }).dataBase64;
      if (typeof b64 !== "string" || b64.length > MAX_IMAGE_B64) {
        return NextResponse.json({ error: "Image too large" }, { status: 413 });
      }
    }
  }

  // Whitelist promptOverrides: only known PromptKey survives; unknown keys dropped.
  const knownKeys = Object.keys(DEFAULT_PROMPTS) as PromptKey[];
  const safeOverrides: Partial<Record<PromptKey, string>> = {};
  const rawOverrides = raw.promptOverrides;
  if (rawOverrides && typeof rawOverrides === "object") {
    for (const k of knownKeys) {
      const v = (rawOverrides as Record<string, unknown>)[k];
      if (typeof v === "string" && v.length <= MAX_OVERRIDE_CHARS) safeOverrides[k] = v;
    }
  }

  const input: AnalyzeInput = {
    customerMessage,
    context: raw.context as AnalyzeInput["context"],
    images: images as AnalyzeInput["images"],
    promptOverrides: safeOverrides,
    claimEvidenceVerified: raw.claimEvidenceVerified === true,
    isCourierPromise: raw.isCourierPromise === true,
    isSensitiveAction: raw.isSensitiveAction === true,
  };

  try {
    const result = await analyzeConversation(input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
