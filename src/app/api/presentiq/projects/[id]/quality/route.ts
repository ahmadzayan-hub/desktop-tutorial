import {
  getRequestContext,
  getSupabase,
  loadBrandContext,
  scoreDeck,
} from "@/lib/presentiq";
import { fail, json, notFound, unauthorized } from "@/lib/presentiq/api/response";

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

  const [{ data: kit }, { data: slides }, { data: evidence }] = await Promise.all([
    project.brand_kit_id
      ? supabase.from("pq_brand_kits").select("*").eq("id", project.brand_kit_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("pq_slides").select("*").eq("project_id", params.id).order("slide_number"),
    supabase.from("pq_evidence_items").select("*").eq("project_id", params.id).limit(500),
  ]);

  const brandCtx = loadBrandContext(kit, project.presentation_mode, project.language_mode);
  const report = scoreDeck({
    slides: (slides ?? []).map((s: any) => ({
      slide_number: s.slide_number,
      title_en: s.title_en,
      title_ar: s.title_ar,
      key_message_en: s.key_message_en,
      key_message_ar: s.key_message_ar,
      content_json: s.content_json,
      visual_json: s.visual_json,
      evidence_refs: s.evidence_refs,
    })),
    ctx: brandCtx,
    evidence: (evidence ?? []) as any,
    templateCompliance: 95,
  });

  // Persist top-line score on the latest deck version
  const { data: latest } = await supabase
    .from("pq_deck_versions")
    .select("id")
    .eq("project_id", params.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest) {
    await supabase
      .from("pq_deck_versions")
      .update({
        quality_scores: report.scores,
        readiness_score: report.scores.boardroom_readiness,
      })
      .eq("id", latest.id);
  }

  return json({ report });
}
