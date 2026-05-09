import { getRequestContext, getSupabase, writeAudit } from "@/lib/presentiq";
import { fail, json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("pq_comments")
    .select("id, slide_id, user_id, body, status, created_at, updated_at")
    .in("slide_id", await slideIds(supabase, ctx.orgId, params.id))
    .order("created_at", { ascending: false });
  return json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { slide_id?: string; body?: string };
  if (!body.slide_id || !body.body) return fail("invalid_input", "slide_id and body required", 400);
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("pq_comments")
    .insert({
      organization_id: ctx.orgId,
      slide_id: body.slide_id,
      user_id: ctx.userId,
      body: body.body.slice(0, 4000),
      status: "open",
    })
    .select()
    .single();
  if (error) return fail("create_failed", error.message, 500);
  await writeAudit(supabase, {
    organization_id: ctx.orgId, user_id: ctx.userId, action: "comment.create",
    object_type: "comment", object_id: data.id, metadata: { slide_id: body.slide_id },
  });
  return json({ comment: data }, { status: 201 });
}

async function slideIds(supabase: any, orgId: string, projectId: string): Promise<string[]> {
  const { data } = await supabase
    .from("pq_slides")
    .select("id")
    .eq("organization_id", orgId)
    .eq("project_id", projectId);
  return (data ?? []).map((r: any) => r.id);
}
