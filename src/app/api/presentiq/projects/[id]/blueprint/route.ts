import {
  buildOrchestrator,
  getRequestContext,
  getSupabase,
  isDemoContext,
  loadBrandContext,
  resolveProvider,
  writeAudit,
} from "@/lib/presentiq";
import { BriefSchema } from "@/lib/presentiq/types";
import { fail, json, notFound } from "@/lib/presentiq/api/response";
import { getProject as getDemoProject, updateProject as updateDemoProject } from "@/lib/presentiq/demo/store";
import { buildDemoBlueprint } from "@/lib/presentiq/demo/blueprint";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getRequestContext();

  // Demo path — synthesise a deterministic blueprint and store it.
  if (isDemoContext(ctx)) {
    const demoProject = getDemoProject(params.id);
    if (!demoProject) return notFound("project");
    const blueprint = buildDemoBlueprint(demoProject);
    updateDemoProject(params.id, { status: "blueprint_ready", blueprint });
    return json({ blueprint });
  }

  const supabase = await getSupabase();
  const { data: project } = await supabase
    .from("pq_presentation_projects")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", ctx.orgId)
    .maybeSingle();
  if (!project) return notFound("project");

  const briefParse = BriefSchema.safeParse({
    title: project.title,
    audience: project.audience ?? undefined,
    objective: project.objective ?? undefined,
    decision_required: project.decision_required ?? undefined,
    language_mode: project.language_mode,
    presentation_mode: project.presentation_mode,
    target_slide_count: project.target_slide_count,
    target_duration_min: project.target_duration_min,
    confidentiality_level: project.confidentiality_level,
    brand_kit_id: project.brand_kit_id ?? undefined,
  });
  if (!briefParse.success) return fail("invalid_brief", "project missing fields", 400);

  let kit = null;
  if (project.brand_kit_id) {
    const { data } = await supabase.from("pq_brand_kits").select("*").eq("id", project.brand_kit_id).maybeSingle();
    kit = data;
  }
  const brandCtx = loadBrandContext(kit, project.presentation_mode, project.language_mode);

  const { data: evidence } = await supabase
    .from("pq_evidence_items")
    .select("id,project_id,source_file_id,claim,value,classification,confidence,source_reference,topic_tags")
    .eq("project_id", project.id)
    .limit(200);

  await supabase.from("pq_presentation_projects").update({ status: "ingesting" }).eq("id", project.id);

  const provider = resolveProvider({
    apiKey: process.env.ANTHROPIC_API_KEY,
    confidentiality: project.confidentiality_level,
  });
  const orch = buildOrchestrator({ provider, orgId: ctx.orgId });

  let blueprint;
  try {
    blueprint = await orch.runBlueprint({ brief: briefParse.data, evidence: (evidence ?? []) as any, ctx: brandCtx });
  } catch (e) {
    return fail("generation_failed", (e as Error).message, 500);
  }

  await supabase
    .from("pq_presentation_projects")
    .update({ status: "blueprint_ready", blueprint })
    .eq("id", project.id);

  await writeAudit(supabase, {
    organization_id: ctx.orgId, user_id: ctx.userId, action: "project.blueprint",
    object_type: "project", object_id: project.id, metadata: { slide_count: project.target_slide_count },
  });

  return json({ blueprint });
}
