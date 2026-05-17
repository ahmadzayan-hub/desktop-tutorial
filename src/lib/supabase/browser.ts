"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase env vars missing.");
  }
  if (_client) return _client;
  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}
