function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaReasoning: process.env.OLLAMA_MODEL_REASONING ?? "llama3",
  ollamaFast: process.env.OLLAMA_MODEL_FAST ?? "mistral",
  ollamaRewrite: process.env.OLLAMA_MODEL_REWRITE ?? "phi3",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  extensionApiKey: process.env.EXTENSION_API_KEY ?? ""
};
