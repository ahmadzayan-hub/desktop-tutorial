"use client";

import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";

export function QualityPanel({ report }: { report: any }) {
  if (!report) return null;
  const scores = report.scores ?? {};
  const dims = [
    ["Brand Compliance", scores.brand_compliance],
    ["Evidence Integrity", scores.evidence_integrity],
    ["Arabic RTL", scores.rtl],
    ["Slide Simplicity", scores.slide_simplicity],
    ["Visual Quality", scores.visual_quality],
    ["Executive Clarity", scores.executive_clarity],
    ["Accessibility", scores.accessibility],
    ["Hallucination Risk", scores.hallucination_risk],
    ["Template Compliance", scores.template_compliance],
  ] as [string, number][];
  return (
    <Card>
      <CardHeader title="Quality" subtitle="10-dimension score" />
      <CardBody>
        <div className="text-center mb-4">
          <div className="text-3xl font-semibold text-zinc-900">{Math.round(scores.boardroom_readiness ?? 0)}</div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">Boardroom Readiness</div>
        </div>
        <div className="space-y-2">
          {dims.map(([label, val]) => (
            <Row key={label} label={label} value={val ?? 0} invert={label === "Hallucination Risk"} />
          ))}
        </div>
        {report.recommendations?.length ? (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            <div className="font-medium mb-1">Recommendations</div>
            <ul className="list-disc list-inside space-y-1">
              {report.recommendations.slice(0, 4).map((r: any, i: number) => (
                <li key={i}>{r.action}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function Row({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const v = Math.round(value);
  const display = invert ? Math.max(0, 100 - v) : v;
  const color = display >= 80 ? "bg-emerald-500" : display >= 60 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between"><span>{label}</span><span className="text-zinc-500">{display}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${display}%` }} />
      </div>
    </div>
  );
}
