/**
 * Build a pptxgenjs theme + masters from a BrandRulesContext.
 *
 * This module imports pptxgenjs lazily so the package can be optional in
 * environments that don't render PPTX (e.g. unit tests).
 */

import type { BrandRulesContext } from "../types";

export const SLIDE_W_IN = 13.333; // 16:9 widescreen
export const SLIDE_H_IN = 7.5;

export type Pptx = any;
export async function loadPptxGen(): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: any = await import("pptxgenjs");
  return mod.default ?? mod;
}

export async function buildDeck(ctx: BrandRulesContext, title: string): Promise<Pptx> {
  const PptxGen = await loadPptxGen();
  const pptx = new PptxGen();
  pptx.title = title;
  pptx.author = "PresentIQ";
  pptx.company = ctx.identity.org_name;
  pptx.layout = "LAYOUT_WIDE";
  pptx.defineLayout({ name: "LAYOUT_WIDE", width: SLIDE_W_IN, height: SLIDE_H_IN });

  defineMasters(pptx, ctx);
  return pptx;
}

function defineMasters(pptx: any, ctx: BrandRulesContext) {
  const margin = ctx.layout.safe_margins_in;
  const logoOpts = logoPlacement(ctx);

  // ----- Cover master -----
  pptx.defineSlideMaster({
    title: "PQ_COVER",
    background: { color: ctx.palette.primary.replace("#", "") },
    objects: [
      ...maybeLogo(ctx, logoOpts),
      {
        rect: {
          x: 0,
          y: SLIDE_H_IN - 0.6,
          w: SLIDE_W_IN,
          h: 0.6,
          fill: { color: ctx.palette.secondary.replace("#", "") },
        },
      },
    ],
    slideNumber: { x: 0, y: 0, w: 0, h: 0, fontSize: 1, color: "FFFFFF" }, // hide
  });

  // ----- Content master -----
  pptx.defineSlideMaster({
    title: "PQ_CONTENT",
    background: { color: ctx.palette.background.replace("#", "") },
    objects: [
      ...maybeLogo(ctx, logoOpts),
      {
        rect: {
          x: margin,
          y: SLIDE_H_IN - 0.4,
          w: SLIDE_W_IN - 2 * margin,
          h: 0.02,
          fill: { color: ctx.palette.surface.replace("#", "") },
        },
      },
      {
        text: {
          text: ctx.identity.org_name,
          options: {
            x: margin,
            y: SLIDE_H_IN - 0.36,
            w: 4,
            h: 0.3,
            fontFace: ctx.typography.en_primary,
            fontSize: 9,
            color: hex(ctx.palette.foreground),
          },
        },
      },
    ],
    slideNumber: {
      x: SLIDE_W_IN - margin - 0.6,
      y: SLIDE_H_IN - 0.36,
      w: 0.6,
      h: 0.3,
      fontFace: ctx.typography.en_primary,
      fontSize: 9,
      color: hex(ctx.palette.foreground),
      align: "right",
    },
  });

  // ----- Divider master -----
  pptx.defineSlideMaster({
    title: "PQ_DIVIDER",
    background: { color: ctx.palette.surface.replace("#", "") },
    objects: maybeLogo(ctx, logoOpts),
  });

  // ----- Decision master -----
  pptx.defineSlideMaster({
    title: "PQ_DECISION",
    background: { color: ctx.palette.background.replace("#", "") },
    objects: [
      ...maybeLogo(ctx, logoOpts),
      {
        rect: {
          x: 0,
          y: 0,
          w: 0.4,
          h: SLIDE_H_IN,
          fill: { color: hex(ctx.palette.secondary) },
        },
      },
    ],
  });
}

function logoPlacement(ctx: BrandRulesContext): { x: number; y: number; w: number; h: number } {
  const margin = ctx.layout.safe_margins_in;
  const w = 1.5;
  const h = 0.6;
  if (ctx.layout.logo_placement === "top_left") {
    return { x: margin, y: margin, w, h };
  }
  if (ctx.layout.logo_placement === "balanced_center") {
    return { x: (SLIDE_W_IN - w) / 2, y: margin, w, h };
  }
  return { x: SLIDE_W_IN - margin - w, y: margin, w, h };
}

function maybeLogo(ctx: BrandRulesContext, p: { x: number; y: number; w: number; h: number }) {
  if (!ctx.identity.logos.primary) return [];
  return [
    {
      image: {
        path: ctx.identity.logos.primary,
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        sizing: { type: "contain", w: p.w, h: p.h },
      },
    },
  ];
}

export function hex(h: string): string {
  return h.replace("#", "").toUpperCase();
}
