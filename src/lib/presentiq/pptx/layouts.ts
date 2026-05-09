/**
 * Layout builders.
 *
 * Each builder mutates a pptxgenjs slide in-place. Builders are pure of state
 * (the slide is the only sink) so they can be composed and unit-tested.
 */

import type { BrandRulesContext, ChartSpec, Slide, SlideModel } from "../types";
import { hex, SLIDE_W_IN, SLIDE_H_IN } from "./theme";
import { buildRuns, isArabic } from "./text";

export type Pptx = any;

const BODY_X = 0.5;
const BODY_W = SLIDE_W_IN - 1.0;

export function addTitle(slide: any, slideModel: Slide, ctx: BrandRulesContext) {
  const margin = ctx.layout.safe_margins_in;
  const titleEn = slideModel.title_en;
  const titleAr = slideModel.title_ar;

  if (titleEn) {
    slide.addText(buildRuns(titleEn, ctx, { bold: true, size: ctx.typography.title_size_pt[1] }), {
      x: margin,
      y: margin + 0.6,
      w: SLIDE_W_IN - 2 * margin,
      h: 0.9,
      align: "left",
      valign: "top",
    });
  }
  if (titleAr) {
    slide.addText(buildRuns(titleAr, ctx, { bold: true, size: ctx.typography.title_size_pt[0] }), {
      x: margin,
      y: margin + 1.5,
      w: SLIDE_W_IN - 2 * margin,
      h: 0.6,
      align: "right",
      valign: "top",
      rtl: true,
    });
  }
}

export function addKeyMessage(slide: any, slideModel: Slide, ctx: BrandRulesContext) {
  const margin = ctx.layout.safe_margins_in;
  const en = slideModel.key_message_en;
  const ar = slideModel.key_message_ar;
  let y = margin + (slideModel.title_ar ? 2.3 : 1.7);
  if (en) {
    slide.addText(buildRuns(en, ctx, { size: ctx.typography.body_size_pt[1] }), {
      x: margin,
      y,
      w: SLIDE_W_IN - 2 * margin,
      h: 0.8,
      color: hex(ctx.palette.secondary),
    });
    y += 0.7;
  }
  if (ar) {
    slide.addText(buildRuns(ar, ctx, { size: ctx.typography.body_size_pt[1] }), {
      x: margin,
      y,
      w: SLIDE_W_IN - 2 * margin,
      h: 0.8,
      color: hex(ctx.palette.secondary),
      align: "right",
      rtl: true,
    });
  }
}

export function renderSlideBody(slide: any, model: SlideModel, ctx: BrandRulesContext) {
  switch (model.kind) {
    case "cover":
      return renderCover(slide, model, ctx);
    case "exec_summary":
      return renderBullets(slide, model.bullets, ctx, "Executive Summary");
    case "decision":
      return renderDecision(slide, model, ctx);
    case "kpi":
      return renderKpi(slide, model, ctx);
    case "timeline":
      return renderTimeline(slide, model, ctx);
    case "process":
      return renderProcess(slide, model, ctx);
    case "matrix":
      return renderMatrix(slide, model, ctx);
    case "risk_heatmap":
      return renderRiskHeatmap(slide, model, ctx);
    case "before_after":
      return renderBeforeAfter(slide, model, ctx);
    case "chart":
      return renderChart(slide, model.spec, ctx);
    case "table":
      return renderTable(slide, model, ctx);
    case "stakeholder_map":
      return renderStakeholderMap(slide, model, ctx);
    case "next_steps":
      return renderNextSteps(slide, model, ctx);
    case "bullets":
      return renderBullets(slide, model.bullets, ctx);
    case "bilingual":
      return renderBilingual(slide, model, ctx);
  }
}

function renderCover(slide: any, m: { title: string; subtitle?: string; date?: string }, ctx: BrandRulesContext) {
  slide.addText(buildRuns(m.title, ctx, { bold: true, size: 44, color: "FFFFFF" }), {
    x: 0.6, y: 2.3, w: SLIDE_W_IN - 1.2, h: 1.6, fontFace: ctx.typography.en_primary,
  });
  if (m.subtitle) {
    slide.addText(buildRuns(m.subtitle, ctx, { size: 18, color: "FFFFFF" }), {
      x: 0.6, y: 4.0, w: SLIDE_W_IN - 1.2, h: 0.8,
    });
  }
  if (m.date) {
    slide.addText(m.date, {
      x: 0.6, y: SLIDE_H_IN - 1.3, w: 4, h: 0.4, fontSize: 12, color: "FFFFFF",
      fontFace: ctx.typography.en_primary,
    });
  }
}

function renderBullets(slide: any, bullets: string[], ctx: BrandRulesContext, title?: string) {
  const yStart = title ? 2.0 : 2.4;
  const items = bullets.slice(0, ctx.layout.max_bullets_per_slide).map((b) => ({
    text: b,
    options: { bullet: { code: "25CF" }, fontFace: isArabic(b) ? ctx.typography.ar_primary : ctx.typography.en_primary, fontSize: 18, paraSpaceAfter: 6, color: hex(ctx.palette.foreground), align: isArabic(b) ? "right" : "left", rtl: isArabic(b) },
  }));
  slide.addText(items, { x: BODY_X, y: yStart, w: BODY_W, h: SLIDE_H_IN - yStart - 0.7, valign: "top" });
}

function renderDecision(slide: any, m: { recommendation: string; rationale: string[] }, ctx: BrandRulesContext) {
  slide.addText(buildRuns(m.recommendation, ctx, { bold: true, size: 22, color: hex(ctx.palette.secondary) }), {
    x: BODY_X, y: 2.0, w: BODY_W, h: 1.0,
  });
  const items = m.rationale.slice(0, ctx.layout.max_bullets_per_slide).map((r) => ({
    text: r,
    options: { bullet: { code: "25B8" }, fontFace: ctx.typography.en_primary, fontSize: 16, color: hex(ctx.palette.foreground), align: isArabic(r) ? "right" : "left", rtl: isArabic(r) },
  }));
  slide.addText(items, { x: BODY_X, y: 3.0, w: BODY_W, h: SLIDE_H_IN - 3.7, valign: "top" });
}

function renderKpi(slide: any, m: { cards: { label: string; value: string; delta?: string }[] }, ctx: BrandRulesContext) {
  const cards = m.cards.slice(0, 4);
  const w = (SLIDE_W_IN - 1.0 - 0.3 * (cards.length - 1)) / cards.length;
  const y = 2.6;
  cards.forEach((c, i) => {
    const x = 0.5 + i * (w + 0.3);
    slide.addShape("rect", {
      x, y, w, h: 2.2,
      fill: { color: hex(ctx.palette.surface) },
      line: { color: hex(ctx.palette.primary), width: 0.5 },
      rectRadius: 0.08,
    });
    slide.addText(buildRuns(c.value, ctx, { bold: true, size: 32, color: hex(ctx.palette.primary) }), {
      x, y: y + 0.2, w, h: 0.9, align: "center",
    });
    slide.addText(buildRuns(c.label, ctx, { size: 12, color: hex(ctx.palette.foreground) }), {
      x, y: y + 1.1, w, h: 0.5, align: "center",
    });
    if (c.delta) {
      slide.addText(c.delta, {
        x, y: y + 1.6, w, h: 0.4, align: "center",
        fontFace: ctx.typography.en_primary, fontSize: 11, color: hex(ctx.palette.accent[0] ?? ctx.palette.secondary),
      });
    }
  });
}

function renderTimeline(slide: any, m: { milestones: { date: string; label: string; status?: string }[] }, ctx: BrandRulesContext) {
  const ms = m.milestones.slice(0, 6);
  if (!ms.length) return;
  const y = 3.6;
  const x0 = 0.7;
  const x1 = SLIDE_W_IN - 0.7;
  slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: hex(ctx.palette.primary), width: 2 } });
  const step = (x1 - x0) / Math.max(1, ms.length - 1);
  ms.forEach((mi, i) => {
    const x = x0 + step * i;
    slide.addShape("ellipse", {
      x: x - 0.12, y: y - 0.12, w: 0.24, h: 0.24,
      fill: { color: hex(ctx.palette.secondary) }, line: { color: "FFFFFF", width: 1.5 },
    });
    slide.addText(buildRuns(mi.label, ctx, { size: 12 }), {
      x: x - 1.0, y: y + 0.25, w: 2.0, h: 0.5, align: "center", color: hex(ctx.palette.foreground),
    });
    slide.addText(mi.date, {
      x: x - 1.0, y: y - 0.7, w: 2.0, h: 0.4, align: "center",
      fontFace: ctx.typography.en_primary, fontSize: 10, color: hex(ctx.palette.foreground),
    });
  });
}

function renderProcess(slide: any, m: { steps: { label: string; description?: string }[] }, ctx: BrandRulesContext) {
  const steps = m.steps.slice(0, 5);
  if (!steps.length) return;
  const y = 3.0;
  const w = (SLIDE_W_IN - 1.0 - 0.3 * (steps.length - 1)) / steps.length;
  steps.forEach((s, i) => {
    const x = 0.5 + i * (w + 0.3);
    slide.addShape("roundRect", { x, y, w, h: 1.4, fill: { color: hex(ctx.palette.primary) }, rectRadius: 0.1 });
    slide.addText(buildRuns(`${i + 1}. ${s.label}`, ctx, { bold: true, color: "FFFFFF", size: 16 }), {
      x, y: y + 0.2, w, h: 0.6, align: "center",
    });
    if (s.description) {
      slide.addText(buildRuns(s.description, ctx, { color: "FFFFFF", size: 11 }), {
        x: x + 0.1, y: y + 0.8, w: w - 0.2, h: 0.5, align: "center",
      });
    }
  });
}

function renderMatrix(slide: any, m: { rows: string[]; cols: string[]; cells: string[][] }, ctx: BrandRulesContext) {
  const headers = ["", ...m.cols];
  const rows = [headers, ...m.rows.map((r, i) => [r, ...(m.cells[i] ?? [])])];
  const tbl = rows.map((row, ri) =>
    row.map((cell, ci) => ({
      text: cell ?? "",
      options: {
        bold: ri === 0 || ci === 0,
        align: "center",
        valign: "middle",
        fill: { color: ri === 0 ? hex(ctx.palette.primary) : ci === 0 ? hex(ctx.palette.surface) : "FFFFFF" },
        color: ri === 0 ? "FFFFFF" : hex(ctx.palette.foreground),
        fontFace: ctx.typography.en_primary,
        fontSize: 12,
      },
    })),
  );
  slide.addTable(tbl, { x: 0.5, y: 2.3, w: SLIDE_W_IN - 1.0, colW: undefined, rowH: 0.45 });
}

function renderRiskHeatmap(slide: any, m: { risks: { name: string; likelihood: 1 | 2 | 3; impact: 1 | 2 | 3 }[] }, ctx: BrandRulesContext) {
  const x0 = 1.5, y0 = 2.6, cell = 1.4;
  // colors: 1=green 2=amber 3=red
  const palette = [["10B981","FBBF24","EF4444"],["10B981","F59E0B","EF4444"],["FBBF24","EF4444","B91C1C"]];
  for (let l = 0; l < 3; l++) {
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * cell;
      const y = y0 + (2 - l) * cell;
      slide.addShape("rect", { x, y, w: cell - 0.05, h: cell - 0.05, fill: { color: palette[l][i] }, line: { color: "FFFFFF", width: 1 } });
    }
  }
  // Axes
  slide.addText("Impact", { x: x0, y: y0 + 3 * cell + 0.05, w: 3 * cell, h: 0.3, align: "center", fontSize: 11, fontFace: ctx.typography.en_primary });
  slide.addText("Likelihood", { x: x0 - 1.2, y: y0, w: 0.3, h: 3 * cell, align: "center", fontSize: 11, rotate: -90, fontFace: ctx.typography.en_primary });
  // Risks
  m.risks.slice(0, 12).forEach((r, idx) => {
    const x = x0 + (r.impact - 1) * cell + 0.1 + (idx % 2) * 0.5;
    const y = y0 + (3 - r.likelihood) * cell + 0.2 + Math.floor(idx / 2) * 0.25;
    slide.addShape("ellipse", { x, y, w: 0.18, h: 0.18, fill: { color: "111827" } });
    slide.addText(r.name, { x: x + 0.22, y: y - 0.05, w: 1.2, h: 0.3, fontSize: 9, fontFace: ctx.typography.en_primary });
  });
}

function renderBeforeAfter(slide: any, m: { before: string[]; after: string[] }, ctx: BrandRulesContext) {
  const colW = (SLIDE_W_IN - 1.5) / 2;
  const y = 2.4;
  const renderCol = (items: string[], x: number, label: string, color: string) => {
    slide.addShape("rect", { x, y, w: colW, h: 4.2, fill: { color: hex(color) }, line: { color: "FFFFFF", width: 0 } });
    slide.addText(label, { x: x + 0.2, y: y + 0.1, w: colW - 0.4, h: 0.5, fontFace: ctx.typography.en_primary, fontSize: 16, bold: true, color: "FFFFFF" });
    const list = items.slice(0, ctx.layout.max_bullets_per_slide).map((i) => ({
      text: i,
      options: { bullet: { code: "25CF" }, fontFace: isArabic(i) ? ctx.typography.ar_primary : ctx.typography.en_primary, fontSize: 13, color: "FFFFFF", rtl: isArabic(i), align: isArabic(i) ? "right" : "left" },
    }));
    slide.addText(list, { x: x + 0.2, y: y + 0.7, w: colW - 0.4, h: 3.4, valign: "top" });
  };
  renderCol(m.before, 0.5, "Before", ctx.palette.foreground);
  renderCol(m.after, 0.5 + colW + 0.5, "After", ctx.palette.secondary);
}

function renderChart(slide: any, spec: ChartSpec, ctx: BrandRulesContext) {
  const data = spec.series.map((s) => ({ name: s.name, labels: spec.categories, values: s.values }));
  const opts: any = {
    x: 0.6, y: 2.3, w: SLIDE_W_IN - 1.2, h: 4.4,
    chartColors: ctx.charts.palette.map(hex),
    showLegend: spec.showLegend ?? true,
    legendPos: "b",
    showTitle: !!spec.title,
    title: spec.title ?? "",
    titleColor: hex(ctx.palette.foreground),
    catAxisLabelFontSize: ctx.charts.label_size_pt,
    valAxisLabelFontSize: ctx.charts.label_size_pt,
    showCatAxisGridLines: ctx.charts.grid !== "minimal",
    showValAxisGridLines: ctx.charts.grid !== "minimal",
    showCatAxisLine: false,
    showValAxisLine: false,
  };
  // Map our kinds to pptxgenjs CHART types — done lazily because pptxgenjs is dynamic.
  const kindToType: Record<ChartSpec["kind"], string> = {
    column: "bar",
    stackedColumn: "bar",
    bar: "bar",
    line: "line",
    area: "area",
    pie: "pie",
    doughnut: "doughnut",
  };
  const t = kindToType[spec.kind] ?? "bar";
  if (spec.kind === "stackedColumn") opts.barGrouping = "stacked";
  if (spec.kind === "column") opts.barDir = "col";
  if (spec.kind === "bar") opts.barDir = spec.kind === "bar" ? "bar" : "col";
  slide.addChart(t as any, data, opts);
}

function renderTable(slide: any, m: { headers: string[]; rows: string[][] }, ctx: BrandRulesContext) {
  const header = m.headers.map((h) => ({
    text: h,
    options: { bold: true, fill: { color: hex(ctx.palette.primary) }, color: "FFFFFF", align: "center", fontFace: ctx.typography.en_primary, fontSize: 12 },
  }));
  const body = m.rows.map((r, ri) =>
    r.map((c) => ({
      text: c ?? "",
      options: {
        fontFace: isArabic(c) ? ctx.typography.ar_primary : ctx.typography.en_primary,
        align: isArabic(c) ? "right" : "left",
        rtl: isArabic(c),
        fontSize: 11,
        fill: { color: ri % 2 === 0 ? "FFFFFF" : hex(ctx.palette.surface) },
      },
    })),
  );
  slide.addTable([header, ...body], { x: 0.5, y: 2.4, w: SLIDE_W_IN - 1.0, rowH: 0.4 });
}

function renderStakeholderMap(slide: any, m: { quadrants: any }, ctx: BrandRulesContext) {
  const x0 = 1.5, y0 = 2.4, w = SLIDE_W_IN - 3.0, h = 4.0;
  const half = w / 2, halfH = h / 2;
  // Quadrant background
  slide.addShape("rect", { x: x0, y: y0, w, h, fill: { color: hex(ctx.palette.surface) }, line: { color: hex(ctx.palette.primary), width: 0.5 } });
  slide.addShape("line", { x: x0 + half, y: y0, w: 0, h, line: { color: hex(ctx.palette.primary), width: 0.5 } });
  slide.addShape("line", { x: x0, y: y0 + halfH, w, h: 0, line: { color: hex(ctx.palette.primary), width: 0.5 } });

  const place = (names: string[], qx: number, qy: number) => {
    const opts = names.slice(0, 4).map((n, i) => ({
      text: n, options: { bullet: { code: "25CF" }, fontFace: ctx.typography.en_primary, fontSize: 11, color: hex(ctx.palette.foreground) },
    }));
    slide.addText(opts, { x: qx + 0.1, y: qy + 0.1, w: half - 0.2, h: halfH - 0.2, valign: "top" });
  };
  place(m.quadrants.high_high ?? [], x0 + half, y0);
  place(m.quadrants.high_low ?? [], x0, y0);
  place(m.quadrants.low_high ?? [], x0 + half, y0 + halfH);
  place(m.quadrants.low_low ?? [], x0, y0 + halfH);

  // Axis labels
  slide.addText("Influence", { x: x0, y: y0 + h + 0.05, w, h: 0.3, align: "center", fontSize: 11, fontFace: ctx.typography.en_primary });
  slide.addText("Interest", { x: x0 - 1.2, y: y0, w: 0.3, h, align: "center", fontSize: 11, rotate: -90, fontFace: ctx.typography.en_primary });
}

function renderNextSteps(slide: any, m: { actions: { owner: string; due: string; action: string }[] }, ctx: BrandRulesContext) {
  const headers = ["Action", "Owner", "Due"];
  const rows = m.actions.slice(0, 6).map((a) => [a.action, a.owner, a.due]);
  renderTable(slide, { headers, rows }, ctx);
}

function renderBilingual(slide: any, m: { en: SlideModel; ar: SlideModel }, ctx: BrandRulesContext) {
  // Naive composition: render EN on left half, AR on right half by adjusting BODY_X/W via a sub-context.
  const halfW = (SLIDE_W_IN - 1.5) / 2;
  // We render each half as separate sub-slides? Instead we composite by adding visuals on each side via shapes/text.
  const sub: any = slide;
  // Just render bullets if both are bullets — this is the most common case for bilingual decks.
  if ((m.en as any).kind === "bullets" && (m.ar as any).kind === "bullets") {
    const en = (m.en as any).bullets as string[];
    const ar = (m.ar as any).bullets as string[];
    const enItems = en.slice(0, ctx.layout.max_bullets_per_slide).map((b) => ({
      text: b, options: { bullet: { code: "25CF" }, fontFace: ctx.typography.en_primary, fontSize: 14 },
    }));
    const arItems = ar.slice(0, ctx.layout.max_bullets_per_slide).map((b) => ({
      text: b, options: { bullet: { code: "25CF" }, fontFace: ctx.typography.ar_primary, fontSize: 14, rtl: true, align: "right" },
    }));
    sub.addText(enItems, { x: 0.5, y: 2.4, w: halfW, h: 4.4, valign: "top" });
    sub.addText(arItems, { x: 0.5 + halfW + 0.5, y: 2.4, w: halfW, h: 4.4, valign: "top" });
  } else {
    // fallback: render the EN on the slide
    renderSlideBody(slide, m.en, ctx);
  }
}
