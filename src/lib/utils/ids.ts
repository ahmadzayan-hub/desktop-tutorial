// Single home for id generation across the app. Prefer this over ad-hoc
// crypto.randomUUID() calls so IDs are prefixed by purpose ("doc_xxx",
// "fact_xxx", "brief_xxx"), which makes them scannable in logs and the
// Supabase dashboard alike.

export function newId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
