// Supabase configuration & feature flag. The app continues to work in
// "demo mode" (cookie-backed mock store) when these env vars are absent —
// useful for local dev and the Vercel preview before Supabase keys are set.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    supabaseUrl.startsWith("http")
  );
}
