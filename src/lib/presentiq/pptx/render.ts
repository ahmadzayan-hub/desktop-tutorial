/**
 * Top-level deck renderer: turn (Slide[], BrandRulesContext) into a .pptx Buffer.
 */

import type { BrandRulesContext, Slide } from "../types";
import { buildDeck } from "./theme";
import { addKeyMessage, addTitle, renderSlideBody } from "./layouts";

export async function renderDeck(args: {
  title: string;
  slides: Slide[];
  ctx: BrandRulesContext;
}): Promise<Buffer> {
  const { title, slides, ctx } = args;
  const pptx = await buildDeck(ctx, title);

  for (const s of slides) {
    const kind = (s.content_json as any)?.kind ?? "bullets";
    const masterName =
      kind === "cover" ? "PQ_COVER" :
      kind === "decision" ? "PQ_DECISION" :
      "PQ_CONTENT";
    const slide = pptx.addSlide({ masterName });

    if (kind !== "cover") {
      addTitle(slide, s, ctx);
      addKeyMessage(slide, s, ctx);
    }
    renderSlideBody(slide, s.content_json, ctx);

    if (s.speaker_notes_en || s.speaker_notes_ar) {
      const note = [s.speaker_notes_en, s.speaker_notes_ar].filter(Boolean).join("\n--- العربية ---\n");
      slide.addNotes(note);
    }
  }

  // Returns Node.js Buffer
  const out = (await pptx.write({ outputType: "nodebuffer" })) as unknown as Buffer;
  return out;
}
