import { getRequestContext, getSupabase, getPlan } from "@/lib/presentiq";
import { json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET() {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  const supabase = await getSupabase();
  const [{ data: org }, { data: sub }] = await Promise.all([
    supabase.from("pq_organizations").select("plan, settings").eq("id", ctx.orgId).maybeSingle(),
    supabase.from("pq_subscriptions").select("*").eq("organization_id", ctx.orgId).maybeSingle(),
  ]);
  return json({
    plan: getPlan((org?.plan as any) ?? "trial"),
    subscription: sub,
    usage: org?.settings?.usage ?? {},
  });
}
