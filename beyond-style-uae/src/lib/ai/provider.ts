// Configurable AI provider wrapper (spec §25).
// The owner picks a provider via AI_PROVIDER env var. NO keys are hard-coded —
// everything comes from environment variables. Adding a provider = add a case.

export type AiProviderName = "openai" | "anthropic" | "gemini" | "mock";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCallOptions {
  // Force JSON-only output (used by the analysis pipeline).
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  // Optional base64 images (chat screenshots / product photos) for vision.
  images?: { mimeType: string; dataBase64: string }[];
}

export interface AiProvider {
  name: AiProviderName;
  model: string;
  complete(messages: ChatMessage[], opts?: AiCallOptions): Promise<string>;
}

function env(key: string): string | undefined {
  return process.env[key];
}

// ---- OpenAI ----
class OpenAiProvider implements AiProvider {
  name: AiProviderName = "openai";
  model = env("OPENAI_MODEL") || "gpt-4o";
  private key = env("OPENAI_API_KEY");

  async complete(messages: ChatMessage[], opts: AiCallOptions = {}): Promise<string> {
    if (!this.key) throw new Error("OPENAI_API_KEY is not set");
    const content: any[] = [];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.key}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 1200,
        response_format: opts.json ? { type: "json_object" } : undefined,
        messages: messages.map((m) =>
          m.role === "user" && opts.images?.length
            ? {
                role: m.role,
                content: [
                  { type: "text", text: m.content },
                  ...opts.images.map((img) => ({
                    type: "image_url",
                    image_url: { url: `data:${img.mimeType};base64,${img.dataBase64}` },
                  })),
                ],
              }
            : { role: m.role, content: m.content }
        ),
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

// ---- Anthropic (Claude) ----
class AnthropicProvider implements AiProvider {
  name: AiProviderName = "anthropic";
  model = env("ANTHROPIC_MODEL") || "claude-sonnet-4-6";
  private key = env("ANTHROPIC_API_KEY");

  async complete(messages: ChatMessage[], opts: AiCallOptions = {}): Promise<string> {
    if (!this.key) throw new Error("ANTHROPIC_API_KEY is not set");
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const rest = messages.filter((m) => m.role !== "system");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens ?? 1200,
        temperature: opts.temperature ?? 0.4,
        system: opts.json ? `${system}\n\nRespond with valid JSON only.` : system,
        messages: rest.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content:
            m.role === "user" && opts.images?.length
              ? [
                  { type: "text", text: m.content },
                  ...opts.images.map((img) => ({
                    type: "image",
                    source: { type: "base64", media_type: img.mimeType, data: img.dataBase64 },
                  })),
                ]
              : m.content,
        })),
      }),
    });
    if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }
}

// ---- Google Gemini ----
class GeminiProvider implements AiProvider {
  name: AiProviderName = "gemini";
  model = env("GEMINI_MODEL") || "gemini-1.5-pro";
  private key = env("GEMINI_API_KEY");

  async complete(messages: ChatMessage[], opts: AiCallOptions = {}): Promise<string> {
    if (!this.key) throw new Error("GEMINI_API_KEY is not set");
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          { text: m.content },
          ...(m.role === "user" && opts.images?.length
            ? opts.images.map((img) => ({
                inlineData: { mimeType: img.mimeType, data: img.dataBase64 },
              }))
            : []),
        ],
      }));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          temperature: opts.temperature ?? 0.4,
          maxOutputTokens: opts.maxTokens ?? 1200,
          responseMimeType: opts.json ? "application/json" : undefined,
        },
        contents,
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
}

// ---- Mock (no network) — used for local dev, tests, and when no key is set ----
class MockProvider implements AiProvider {
  name: AiProviderName = "mock";
  model = "mock";
  async complete(): Promise<string> {
    return JSON.stringify({
      customer_intent: "[mock] configure a real AI_PROVIDER + API key to enable live analysis",
      lead_temperature: "warm",
      customer_persona: "personal_buyer",
      product_identified: "unknown",
      name_check: "mock",
      correct_arabic_name: null,
      missing_information: ["product", "colour", "emirate"],
      risk_or_caution: ["mock provider — no live model call"],
      best_reply_to_send: "Hello 🤍 How can we help you today?",
      next_action: "Identify product interest.",
      follow_up_timing: "Next day if no reply.",
      internal_sales_note: "Mock output. Set AI_PROVIDER and the matching API key.",
      order_record_update: null,
      confidence_score: 0.1,
    });
  }
}

export function getProvider(): AiProvider {
  const name = (env("AI_PROVIDER") || "mock").toLowerCase() as AiProviderName;
  switch (name) {
    case "openai":
      return new OpenAiProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "gemini":
      return new GeminiProvider();
    default:
      return new MockProvider();
  }
}
