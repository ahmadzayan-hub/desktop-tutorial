-- RPC function called by study-packs API to atomically increment the
-- ai_queries_used counter. Using a server-side function avoids the need
-- for supabase.raw() (removed in supabase-js v2).
CREATE OR REPLACE FUNCTION increment_ai_queries(uid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE subscriptions SET ai_queries_used = ai_queries_used + 1 WHERE user_id = uid;
$$;
