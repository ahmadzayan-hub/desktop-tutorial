import {
  getRequestContext,
  getSupabase,
  loadBrandContext,
  renderDeck,
  writeAudit,
} from "@/lib/presentiq";
import { fail, json, notFound, unauthorized } from "@/lib/presentiq/api/response";

export const runtime = "nodejs";
export const maxDuration = 180;

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

  const [{ data: kit }, { data: slides }, { data: latest }] = await Promise.all([
    project.brand_kit_id
      ? supabase.from("pq_brand_kits").select("*").eq("id", project.brand_kit_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("pq_slides").select("*").eq("project_id", params.id).order("slide_number"),
    supabase.from("pq_deck_versions").select("*").eq("project_id", params.id).order("version_number", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!slides?.length) return fail("no_slides", "Generate slides first", 400);

  const brandCtx = loadBrandContext(kit, project.presentation_mode, project.language_mode);

  let buf: Buffer;
  try {
    buf = await renderDeck({
      title: project.title,
      ctx: brandCtx,
      slides: slides.map((s: any) => ({
        slide_number: s.slide_number,
        title_en: s.title_en,
        title_ar: s.title_ar,
        purpose: s.purpose,
        key_message_en: s.key_message_en,
        key_message_ar: s.key_message_ar,
        content_json: s.content_json,
        visual_json: s.visual_json,
        speaker_notes_en: s.speaker_notes_en,
        speaker_notes_ar: s.speaker_notes_ar,
      })),
    });
  } catch (e) {
    return fail("render_failed", (e as Error).message, 500);
  }

  const version = latest?.version_number ?? 1;
  const path = `org/${ctx.orgId}/projects/${params.id}/deck-v${version}.pptx`;
  const { error: upErr } = await supabase.storage.from("pq-renders").upload(path, buf, {
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    upsert: true,
  });
  if (upErr) return fail("upload_failed", upErr.message, 500);

  const { data: signed } = await supabase.storage.from("pq-renders").createSignedUrl(path, 3600 * 24);

  await supabase
    .from("pq_deck_versions")
    .update({ pptx_url: signed?.signedUrl, pptx_path: path })
    .eq("id", latest?.id);

  await supabase.from("pq_presentation_projects").update({ status: "exported" }).eq("id", params.id);

  await writeAudit(supabase, {
    organization_id: ctx.orgId, user_id: ctx.userId, action: "project.export.pptx",
    object_type: "deck_version", object_id: latest?.id, metadata: { version, size_bytes: buf.length },
  });

  return json({ url: signed?.signedUrl, path, version });
}
