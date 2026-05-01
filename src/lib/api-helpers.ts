import { NextResponse } from "next/server";
import { LlmUnreachableError } from "@/lib/llm/ollama";

/**
 * Translate engine errors into clean HTTP responses.
 * Use as: `return handleError(e)` inside API route catch blocks.
 */
export function handleError(e: unknown): NextResponse {
  if (e instanceof LlmUnreachableError) {
    return NextResponse.json(
      {
        error: "llm_unreachable",
        message: e.message,
        hint:
          "Start Ollama locally (`ollama serve`) or set OLLAMA_BASE_URL to a reachable endpoint, e.g. via a Cloudflare tunnel.",
        base_url: e.baseUrl
      },
      { status: 503 }
    );
  }
  console.error("[api]", e);
  return NextResponse.json({ error: "internal", message: (e as Error)?.message }, { status: 500 });
}
