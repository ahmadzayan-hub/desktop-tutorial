import { getRequestContext, getSupabase, writeAudit } from "@/lib/presentiq";
import { BriefSchema } from "@/lib/presentiq/types";
import { fail, json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET() {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("pq_presentation_projects")
    .select("id,title,status,presentation_mode,language_mode,created_at,updated_at")
    .eq("organization_id", ctx.orgId)
    .order("updated_at", { ascending: false })
    .limit(100);
  return json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  if (!["owner", "admin", "editor"].includes(ctx.role)) return fail("forbidden", "insufficient role", 403);
  const parsed = BriefSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail("invalid_input", "validation failed", 400, parsed.error.issues);
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("pq_presentation_projects")
    .insert({
      organization_id: ctx.orgId,
      owner_id: ctx.userId,
      brand_kit_id: parsed.data.brand_kit_id ?? null,
      title: parsed.data.title,
      audience: parsed.data.audience ?? null,
      objective: parsed.data.objective ?? null,
      decision_required: parsed.data.decision_required ?? null,
      language_mode: parsed.data.language_mode,
      presentation_mode: parsed.data.presentation_mode,
      target_slide_count: parsed.data.target_slide_count,
      target_duration_min: parsed.data.target_duration_min,
      confidentiality_level: parsed.data.confidentiality_level,
      status: "draft",
    })
    .select()
    .single();
  if (error) return fail("create_failed", error.message, 500);
  await writeAudit(supabase, {
    organization_id: ctx.orgId, user_id: ctx.userId, action: "project.create",
    object_type: "project", object_id: data.id, metadata: { title: data.title, mode: data.presentation_mode },
  });
  return json({ project: data }, { status: 201 });
}
