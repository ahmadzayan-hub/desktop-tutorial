/**
 * Resolve the current user + org from the Supabase session.
 *
 * Used by every API route that performs tenant-scoped reads/writes.
 * RLS still enforces isolation; this is for application-level access checks
 * and audit logging.
 */

import { getSupabase } from "../storage/supabase";

export type RequestContext = {
  userId: string;
  orgId: string;
  email: string;
  role: "owner" | "admin" | "editor" | "reviewer" | "viewer";
};

export async function getRequestContext(): Promise<RequestContext | null> {
  try {
    const supabase = await getSupabase();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult?.user;
    if (!user) return null;

    const { data: row } = await supabase
      .from("pq_users")
      .select("organization_id, role, email, name")
      .eq("id", user.id)
      .maybeSingle();

    // First-login bootstrap: if pq_users row doesn't exist, create a personal org.
    if (!row) {
      const created = await bootstrapUser(supabase, user.id, user.email ?? "");
      if (!created) return null;
      return { userId: user.id, orgId: created.org_id, email: user.email ?? "", role: "owner" };
    }

    return {
      userId: user.id,
      orgId: row.organization_id,
      email: row.email ?? user.email ?? "",
      role: (row.role ?? "editor") as RequestContext["role"],
    };
  } catch {
    return null;
  }
}

async function bootstrapUser(
  supabase: any,
  userId: string,
  email: string,
): Promise<{ org_id: string } | null> {
  const slug = (email.split("@")[0] || "user") + "-" + userId.slice(0, 8);
  const { data: org } = await supabase
    .from("pq_organizations")
    .insert({ name: email || "My Workspace", slug, plan: "trial" })
    .select()
    .single();
  if (!org) return null;
  await supabase.from("pq_users").insert({
    id: userId,
    organization_id: org.id,
    name: email,
    email,
    role: "owner",
  });
  await supabase.from("pq_subscriptions").insert({
    organization_id: org.id,
    plan: "trial",
    status: "trialing",
    provider: "stripe",
    trial_ends_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  return { org_id: org.id };
}

export function requireRole(ctx: RequestContext, ...allowed: RequestContext["role"][]): boolean {
  return allowed.includes(ctx.role);
}
