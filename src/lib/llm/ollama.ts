import { env } from "@/lib/env";

export interface OllamaOptions {
  model?: string;
  system?: string;
  temperature?: number;
  format?: "json";
  signal?: AbortSignal;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

/**
 * Single-shot generate against a local Ollama daemon.
 * Free, offline, no API keys required.
 */
export async function generate(prompt: string, opts: OllamaOptions = {}): Promise<string> {
  const body = {
    model: opts.model ?? env.ollamaReasoning,
    prompt,
    system: opts.system,
    stream: false,
    format: opts.format,
    options: { temperature: opts.temperature ?? 0.2 }
  };

  const res = await fetch(`${env.ollamaBaseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.signal
  });

  if (!res.ok) {
    throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as OllamaResponse;
  return data.response.trim();
}

/** Generate and parse JSON. Falls back to a {raw} envelope on parse failure. */
export async function generateJson<T = unknown>(
  prompt: string,
  opts: OllamaOptions = {}
): Promise<T | { raw: string }> {
  const raw = await generate(prompt, { ...opts, format: "json" });
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try to recover the first {...} block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fallthrough */
      }
    }
    return { raw };
  }
}
