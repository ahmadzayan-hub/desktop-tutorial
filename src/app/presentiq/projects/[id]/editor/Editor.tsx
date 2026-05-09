"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Button } from "@/components/presentiq/ui/Button";
import { Badge } from "@/components/presentiq/ui/Badge";
import { QualityPanel } from "@/components/presentiq/QualityPanel";

type Slide = {
  id: string;
  slide_number: number;
  title_en?: string;
  title_ar?: string;
  key_message_en?: string;
  key_message_ar?: string;
  speaker_notes_en?: string;
  speaker_notes_ar?: string;
  content_json: any;
  status: string;
};

export function Editor({ projectId, initialSlides, title }: { projectId: string; initialSlides: Slide[]; title: string }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [activeId, setActiveId] = useState<string | null>(initialSlides[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<any>(null);

  const active = useMemo(() => slides.find((s) => s.id === activeId) ?? null, [slides, activeId]);

  async function readJsonOrText(res: Response): Promise<any> {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); }
    catch { return { error: { message: text.slice(0, 240) || `${res.status} ${res.statusText}` } }; }
  }

  async function regen(instruction: string) {
    if (!active) return;
    setBusy(instruction); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/regenerate-slide/${active.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await readJsonOrText(res);
      if (!res.ok) throw new Error(data?.error?.message ?? `failed (${res.status})`);
      if (!data?.slide) throw new Error("response missing slide payload");
      setSlides((prev) => prev.map((s) => (s.id === active.id ? { ...s, ...data.slide } : s)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function checkQuality() {
    setBusy("quality"); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/quality`, { method: "POST" });
      const data = await readJsonOrText(res);
      if (!res.ok) throw new Error(data?.error?.message ?? `failed (${res.status})`);
      if (!data?.report) throw new Error("response missing report payload");
      setQuality(data.report);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function exportPptx() {
    setBusy("pptx"); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/export-pptx`, { method: "POST" });
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.error?.message ?? `export failed (${res.status})`);
      }
      if (ct.includes("application/json")) {
        const data = await res.json();
        if (data.url) window.open(data.url, "_blank");
        else throw new Error("export response missing url");
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const filename = (title || "presentation").replace(/[^\w؀-ۿ\-]+/g, "_") + ".pptx";
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 min-h-[70vh]">
      {/* Storyboard */}
      <aside className="col-span-12 lg:col-span-3">
        <Card>
          <CardHeader title="Storyboard" subtitle={`${slides.length} slides`} />
          <CardBody className="space-y-1 max-h-[70vh] overflow-y-auto p-2">
            {slides.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border ${activeId === s.id ? "border-zinc-900 bg-zinc-50" : "border-transparent hover:bg-zinc-50"}`}
              >
                <div className="text-xs text-zinc-400">Slide {s.slide_number}</div>
                <div className="text-sm font-medium truncate">{s.title_en ?? "Untitled"}</div>
                {s.title_ar && <div className="text-xs text-zinc-600 truncate" dir="rtl">{s.title_ar}</div>}
                <Badge tone={s.status === "approved" ? "green" : s.status === "locked" ? "navy" : "zinc"}>{s.status}</Badge>
              </button>
            ))}
          </CardBody>
        </Card>
      </aside>

      {/* Preview */}
      <section className="col-span-12 lg:col-span-6">
        <Card>
          <CardHeader title={active ? `Slide ${active.slide_number}` : title} action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={checkQuality} disabled={busy !== null}>Run quality</Button>
              <Button onClick={exportPptx} disabled={busy !== null}>Export PPTX</Button>
            </div>
          } />
          <CardBody>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 mb-4">{error}</div>
            )}
            {!active ? (
              <div className="text-sm text-zinc-500">Select a slide.</div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">{active.title_en ?? "Untitled"}</h2>
                {active.title_ar && (<h3 className="text-xl text-zinc-700" dir="rtl">{active.title_ar}</h3>)}
                {active.key_message_en && <p className="text-zinc-700">{active.key_message_en}</p>}
                {active.key_message_ar && <p className="text-zinc-700" dir="rtl">{active.key_message_ar}</p>}
                <SlideContent model={active.content_json} />
                {(active.speaker_notes_en || active.speaker_notes_ar) && (
                  <div className="mt-6 rounded-xl border border-zinc-200 p-4 bg-zinc-50">
                    <div className="text-xs uppercase text-zinc-500 mb-1">Speaker notes</div>
                    {active.speaker_notes_en && <p className="text-sm text-zinc-700">{active.speaker_notes_en}</p>}
                    {active.speaker_notes_ar && <p className="text-sm text-zinc-700 mt-2" dir="rtl">{active.speaker_notes_ar}</p>}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Actions panel */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <Card>
          <CardHeader title="Actions" />
          <CardBody className="grid grid-cols-1 gap-2">
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Regenerate this slide.")}>{busy === "Regenerate this slide." ? "…" : "Regenerate"}</Button>
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Simplify the slide. One idea, max 5 bullets.")}>Simplify</Button>
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Make it more executive. Statement-style title, fewer words.")}>Make executive</Button>
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Make it more visual. Replace text with a chart or diagram.")}>Make visual</Button>
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Translate to Arabic and add the Arabic version.")}>Translate to Arabic</Button>
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Convert to bilingual: keep EN, add formal corporate AR.")}>Convert bilingual</Button>
            <Button variant="secondary" disabled={!active || busy !== null} onClick={() => regen("Add executive speaker notes in EN and AR.")}>Add speaker notes</Button>
          </CardBody>
        </Card>
        {quality && <QualityPanel report={quality} />}
      </aside>
    </div>
  );
}

function SlideContent({ model }: { model: any }) {
  if (!model) return null;
  switch (model.kind) {
    case "cover":
      return (
        <div className="rounded-2xl p-6 text-white" style={{ background: "var(--pq-grad-pine)", minHeight: 220 }}>
          <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">{model.subtitle ? "Cover" : "Title"}</div>
          <div className="mt-2 text-3xl font-bold leading-tight">{model.title}</div>
          {model.subtitle && <div className="mt-3 text-sm opacity-90 max-w-prose">{model.subtitle}</div>}
          {model.date && <div className="mt-4 text-xs opacity-75">{model.date}</div>}
        </div>
      );
    case "bullets":
    case "exec_summary":
      return (
        <ol className="space-y-2.5">{(model.bullets ?? []).map((b: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 grid place-items-center w-6 h-6 rounded-full text-xs font-semibold text-white shrink-0" style={{ background: "var(--pq-deep)" }}>{i + 1}</span>
            <span className="text-zinc-800">{b}</span>
          </li>
        ))}</ol>
      );
    case "decision":
      return (
        <div>
          <div className="rounded-xl p-4 text-white" style={{ background: "var(--pq-deep)" }}>
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-75">Recommendation</div>
            <p className="text-lg font-semibold mt-1">{model.recommendation}</p>
          </div>
          <ol className="mt-4 space-y-2">{(model.rationale ?? []).map((b: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full text-[10px] font-semibold text-white shrink-0" style={{ background: "var(--pq-bronze)" }}>{i + 1}</span>
              <span className="text-zinc-800 text-sm">{b}</span>
            </li>
          ))}</ol>
        </div>
      );
    case "kpi":
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{(model.cards ?? []).map((c: any, i: number) => (
          <div key={i} className="relative rounded-xl border border-zinc-200 p-4 bg-white shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--pq-deep)" }} />
            <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-1">{c.label}</div>
            <div className="text-3xl font-bold mt-1" style={{ color: "var(--pq-deep)" }}>{c.value}</div>
            {c.delta && <div className="text-xs mt-1.5 font-medium" style={{ color: c.delta.startsWith("-") ? "#B91C1C" : "var(--pq-bronze)" }}>{c.delta}</div>}
          </div>
        ))}</div>
      );
    case "timeline":
      return (
        <div className="relative pt-8 pb-2">
          <div className="absolute left-2 right-2 top-12 h-0.5" style={{ background: "var(--pq-deep)" }} />
          <div className="grid" style={{ gridTemplateColumns: `repeat(${(model.milestones ?? []).length || 1}, 1fr)` }}>
            {(model.milestones ?? []).map((m: any, i: number) => (
              <div key={i} className="text-center px-2 relative">
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: "var(--pq-deep)" }}>{m.date}</div>
                <div className="mx-auto mt-2 w-3 h-3 rounded-full ring-2 ring-white" style={{ background: "var(--pq-bronze)" }} />
                <div className="mt-2 text-xs text-zinc-700 leading-snug">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "matrix":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr>
            <th className="px-2 py-1 bg-zinc-100 border-b border-zinc-200" />
            {(model.cols ?? []).map((c: string) => (<th key={c} className="text-left bg-zinc-100 px-2 py-1 border-b border-zinc-200 text-xs">{c}</th>))}
          </tr></thead>
          <tbody>{(model.rows ?? []).map((r: string, i: number) => (
            <tr key={r}>
              <td className="px-2 py-1 bg-zinc-50 font-medium text-xs">{r}</td>
              {(model.cells?.[i] ?? []).map((cell: string, j: number) => (<td key={j} className="px-2 py-1 border-b border-zinc-100 text-xs">{cell}</td>))}
            </tr>
          ))}</tbody>
        </table>
      );
    case "stakeholder_map":
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-[16/8]">
          {[
            { key: "high_high", label: "High influence · High interest", color: "var(--pq-deep)" },
            { key: "high_low",  label: "High influence · Low interest",  color: "var(--pq-olive)" },
            { key: "low_high",  label: "Low influence · High interest",  color: "var(--pq-sage)" },
            { key: "low_low",   label: "Low influence · Low interest",    color: "rgba(123,142,88,0.5)" },
          ].map((q) => (
            <div key={q.key} className="rounded-xl p-3 text-white" style={{ background: q.color }}>
              <div className="text-[10px] uppercase tracking-widest opacity-80">{q.label}</div>
              <ul className="mt-1.5 text-xs list-disc list-inside opacity-95">
                {(model.quadrants?.[q.key] ?? []).map((n: string, i: number) => (<li key={i}>{n}</li>))}
              </ul>
            </div>
          ))}
        </div>
      );
    case "next_steps":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr className="text-zinc-500 text-[10px] uppercase tracking-widest">
            <th className="text-left py-1.5 pl-1 border-b border-zinc-200">Action</th>
            <th className="text-left py-1.5 border-b border-zinc-200">Owner</th>
            <th className="text-left py-1.5 border-b border-zinc-200">Due</th>
          </tr></thead>
          <tbody>{(model.actions ?? []).map((a: any, i: number) => (
            <tr key={i} className="border-t border-zinc-100">
              <td className="py-2 pl-1 text-zinc-800">{a.action}</td>
              <td className="py-2 text-zinc-700"><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(66,87,34,0.12)", color: "var(--pq-deep)" }}>{a.owner}</span></td>
              <td className="py-2 text-zinc-600">{a.due}</td>
            </tr>
          ))}</tbody>
        </table>
      );
    case "table":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr>{(model.headers ?? []).map((h: string) => (<th key={h} className="text-left text-white px-2 py-1.5 text-xs" style={{ background: "var(--pq-deep)" }}>{h}</th>))}</tr></thead>
          <tbody>{(model.rows ?? []).map((r: string[], i: number) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "white" : "rgba(123,142,88,0.06)" }}>
              {r.map((c, j) => (<td key={j} className="px-2 py-1.5 border-b border-zinc-100">{c}</td>))}
            </tr>
          ))}</tbody>
        </table>
      );
    case "chart":
      return (
        <div className="rounded-xl border border-zinc-200 p-4 bg-white">
          <div className="text-xs font-semibold text-zinc-700 mb-2">{model.spec?.title ?? "Chart"}</div>
          <div className="text-xs text-zinc-500">{model.spec?.kind ?? "column"} · {(model.spec?.categories ?? []).length} categories · {(model.spec?.series ?? []).length} series</div>
          <div className="mt-3 grid grid-flow-col auto-cols-fr items-end gap-2 h-32">
            {(model.spec?.categories ?? []).map((cat: string, i: number) => {
              const max = Math.max(...((model.spec?.series ?? []).flatMap((s: any) => s.values ?? [0])).map(Math.abs));
              return (
                <div key={cat} className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5 items-end h-24">
                    {(model.spec?.series ?? []).map((s: any, j: number) => {
                      const v = Math.abs(s.values?.[i] ?? 0);
                      const h = max > 0 ? (v / max) * 100 : 0;
                      const colors = ["var(--pq-deep)", "var(--pq-bronze)", "var(--pq-sage)"];
                      return <div key={j} className="w-3 rounded-t" style={{ height: `${h}%`, background: colors[j % 3] }} />;
                    })}
                  </div>
                  <div className="text-[10px] text-zinc-500">{cat}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    default:
      return <pre className="bg-zinc-100 p-3 rounded text-xs overflow-x-auto">{JSON.stringify(model, null, 2)}</pre>;
  }
}
