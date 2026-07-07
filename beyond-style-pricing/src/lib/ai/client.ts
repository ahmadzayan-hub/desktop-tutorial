/**
 * Provider-agnostic LLM client speaking the OpenAI chat-completions protocol.
 * Works with open-source models served by: Ollama, vLLM, LM Studio,
 * Together.ai, Groq, Fireworks, OpenRouter — set AI_BASE_URL / AI_API_KEY.
 *
 * Recommended open-source models:
 *   text/tools : Llama 3.3 70B, Qwen 2.5 72B (hosted) · llama3.1:8b (local)
 *   vision     : Qwen 2.5-VL 72B (hosted) · qwen2.5vl:7b, llama3.2-vision (local)
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  name?: string;
}

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatResult {
  content: string;
  toolCalls: ToolCall[];
}

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_BASE_URL);
}

export async function chat(opts: {
  messages: ChatMessage[];
  model?: 'text' | 'vision';
  tools?: ToolDef[];
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
}): Promise<ChatResult> {
  const base = process.env.AI_BASE_URL;
  if (!base) {
    throw new Error(
      'AI is not configured. Set AI_BASE_URL (any OpenAI-compatible endpoint: Ollama, vLLM, Groq, Together…) in .env.'
    );
  }
  const model =
    opts.model === 'vision'
      ? process.env.AI_VISION_MODEL || 'qwen2.5vl:7b'
      : process.env.AI_TEXT_MODEL || 'llama3.1:8b';

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 2048,
  };
  if (opts.tools?.length) body.tools = opts.tools;
  if (opts.jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.AI_API_KEY
        ? { authorization: `Bearer ${process.env.AI_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM endpoint error ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const msg = data.choices?.[0]?.message ?? {};
  return {
    content: typeof msg.content === 'string' ? msg.content : '',
    toolCalls: (msg.tool_calls as ToolCall[]) ?? [],
  };
}

/**
 * Structured JSON extraction with a validate-and-retry loop.
 * The model gets the schema in-prompt; output is parsed and validated with
 * zod; on failure the error is fed back and the model retries (max `retries`).
 */
export async function extractJson<T>(opts: {
  messages: ChatMessage[];
  parse: (raw: unknown) => T; // throw to reject (e.g. zod .parse)
  model?: 'text' | 'vision';
  retries?: number;
}): Promise<T> {
  const retries = opts.retries ?? 2;
  const messages = [...opts.messages];
  let lastErr = '';
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await chat({
      messages,
      model: opts.model,
      jsonMode: true,
      temperature: 0.1,
    });
    try {
      const raw = JSON.parse(firstJsonBlock(res.content));
      return opts.parse(raw);
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      messages.push(
        { role: 'assistant', content: res.content },
        {
          role: 'user',
          content: `Your JSON was invalid: ${lastErr}. Reply again with ONLY a valid JSON object matching the schema. No prose.`,
        }
      );
    }
  }
  throw new Error(`Structured extraction failed after retries: ${lastErr}`);
}

function firstJsonBlock(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in response');
  return text.slice(start, end + 1);
}
