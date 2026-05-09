import {
  buildOrchestrator,
  getRequestContext,
  getSupabase,
  loadBrandContext,
  resolveProvider,
  writeAudit,
} from "@/lib/presentiq";
import { BriefSchema, type Slide } from "@/lib/presentiq/types";
import { fail, json, notFound, unauthorized } from "@/lib/presentiq/api/response";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  const supabase = await getSupabase();

  const { data: project } = await supabase
    .from("pq_presentation_projects")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", ctx.orgId)
    .maybeSingle();
  if (!project) return notFound("project");
  if (!project.blueprint || !Object.keys(project.blueprint).length) {
    return fail("blueprint_required", "Run /blueprint first", 400);
  }

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
    .limit(500);

  await supabase.from("pq_presentation_projects").update({ status: "generating" }).eq("id", project.id);

  const provider = resolveProvider({
    apiKey: process.env.ANTHROPIC_API_KEY,
    confidentiality: project.confidentiality_level,
  });
  const orch = buildOrchestrator({ provider, orgId: ctx.orgId });

  let slides: Slide[] = [];
  let quality;
  try {
    const result = await orch.runDeck({
      brief: briefParse.data,
      evidence: (evidence ?? []) as any,
      ctx: brandCtx,
      blueprint: project.blueprint,
    });
    slides = result.slides;
    quality = result.quality;
  } catch (e) {
    return fail("generation_failed", (e as Error).message, 500);
  }

  // Persist a new deck version + slides.
  const { data: lastVersion } = await supabase
    .from("pq_deck_versions")
    .select("version_number")
    .eq("project_id", project.id)
    .order("version_number", { ascending: false })
    .limit(1);
  const nextVersion = (lastVersion?.[0]?.version_number ?? 0) + 1;

  const { data: deckVersion } = await supabase
    .from("pq_deck_versions")
    .insert({
      organization_id: ctx.orgId,
      project_id: project.id,
      version_number: nextVersion,
      readiness_score: quality.scores.boardroom_readiness,
      quality_scores: quality.scores,
      created_by: ctx.userId,
    })
    .select()
    .single();

  // Replace prior slides for this version
  await supabase.from("pq_slides").delete().eq("project_id", project.id);
  await supabase.from("pq_slides").insert(
    slides.map((s) => ({
      organization_id: ctx.orgId,
      project_id: project.id,
      deck_version_id: deckVersion?.id,
      slide_number: s.slide_number,
      title_en: s.title_en ?? null,
      title_ar: s.title_ar ?? null,
      purpose: s.purpose ?? null,
      key_message_en: s.key_message_en ?? null,
      key_message_ar: s.key_message_ar ?? null,
      content_json: s.content_json,
      visual_json: s.visual_json ?? {},
      speaker_notes_en: s.speaker_notes_en ?? null,
      speaker_notes_ar: s.speaker_notes_ar ?? null,
      animation_plan: s.animation_plan ?? {},
      evidence_refs: s.evidence_refs ?? [],
      quality_scores: s.quality_scores ?? {},
      status: "generated",
    })),
  );

  await supabase.from("pq_presentation_projects").update({ status: "ready" }).eq("id", project.id);

  await writeAudit(supabase, {
    organization_id: ctx.orgId, user_id: ctx.userId, action: "project.generate_deck",
    object_type: "deck_version", object_id: deckVersion?.id, metadata: { version: nextVersion, slides: slides.length },
  });

  return json({ deck_version: deckVersion, slides, quality });
}
