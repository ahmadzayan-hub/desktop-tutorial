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

  async function regen(instruction: string) {
    if (!active) return;
    setBusy(instruction); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/regenerate-slide/${active.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "failed");
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "failed");
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
    case "bullets":
      return (
        <ul className="list-disc list-inside text-zinc-800 space-y-1">{(model.bullets ?? []).map((b: string, i: number) => (<li key={i}>{b}</li>))}</ul>
      );
    case "exec_summary":
      return (
        <ul className="list-disc list-inside text-zinc-800 space-y-1">{(model.bullets ?? []).map((b: string, i: number) => (<li key={i}>{b}</li>))}</ul>
      );
    case "decision":
      return (
        <div>
          <p className="text-lg font-medium text-zinc-900">{model.recommendation}</p>
          <ul className="list-disc list-inside text-zinc-700 mt-2 space-y-1">{(model.rationale ?? []).map((b: string, i: number) => (<li key={i}>{b}</li>))}</ul>
        </div>
      );
    case "kpi":
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{(model.cards ?? []).map((c: any, i: number) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-900">{c.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{c.label}</div>
            {c.delta && <div className="text-xs text-emerald-700 mt-1">{c.delta}</div>}
          </div>
        ))}</div>
      );
    case "next_steps":
      return (
        <table className="w-full text-sm">
          <thead className="text-zinc-500 text-xs uppercase"><tr><th className="text-left py-1">Action</th><th className="text-left">Owner</th><th className="text-left">Due</th></tr></thead>
          <tbody>{(model.actions ?? []).map((a: any, i: number) => (
            <tr key={i} className="border-t border-zinc-100"><td className="py-1.5">{a.action}</td><td>{a.owner}</td><td>{a.due}</td></tr>
          ))}</tbody>
        </table>
      );
    case "table":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr>{(model.headers ?? []).map((h: string) => (<th key={h} className="text-left bg-zinc-100 px-2 py-1 border-b border-zinc-200">{h}</th>))}</tr></thead>
          <tbody>{(model.rows ?? []).map((r: string[], i: number) => (
            <tr key={i}>{r.map((c, j) => (<td key={j} className="px-2 py-1 border-b border-zinc-100">{c}</td>))}</tr>
          ))}</tbody>
        </table>
      );
    default:
      return <pre className="bg-zinc-100 p-3 rounded text-xs overflow-x-auto">{JSON.stringify(model, null, 2)}</pre>;
  }
}
