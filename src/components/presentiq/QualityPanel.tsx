"use client";

import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";

export function QualityPanel({ report }: { report: any }) {
  if (!report) return null;
  const scores = report.scores ?? {};
  const dims = [
    ["Brand Compliance",   scores.brand_compliance],
    ["Evidence Integrity", scores.evidence_integrity],
    ["Arabic RTL",         scores.rtl],
    ["Slide Simplicity",   scores.slide_simplicity],
    ["Visual Quality",     scores.visual_quality],
    ["Executive Clarity",  scores.executive_clarity],
    ["Accessibility",      scores.accessibility],
    ["Hallucination Risk", scores.hallucination_risk],
    ["Template Compliance",scores.template_compliance],
  ] as [string, number][];

  const readiness = Math.round(scores.boardroom_readiness ?? 0);
  const readinessLabel =
    readiness >= 95 ? "Boardroom-ready" :
    readiness >= 80 ? "Almost ready"     :
    readiness >= 60 ? "Needs revision"   :
                      "Not ready";
  const ringColor =
    readiness >= 95 ? "var(--pq-deep)" :
    readiness >= 80 ? "var(--pq-bronze)" :
                      "#B91C1C";

  return (
    <Card>
      <CardHeader title="Quality" subtitle="10-dimension score" />
      <CardBody>
        {/* Big readiness ring */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="grid place-items-center rounded-full shrink-0"
            style={{
              width: 88,
              height: 88,
              background: `conic-gradient(${ringColor} ${readiness * 3.6}deg, rgba(66,87,34,0.10) 0)`,
            }}
            aria-hidden
          >
            <div className="grid place-items-center rounded-full bg-white" style={{ width: 70, height: 70 }}>
              <div className="text-2xl font-bold" style={{ color: ringColor }}>{readiness}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Boardroom Readiness
            </div>
            <div className="text-base font-semibold mt-0.5" style={{ color: ringColor }}>
              {readinessLabel}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {dims.map(([label, val]) => (
            <Row key={label} label={label} value={val ?? 0} invert={label === "Hallucination Risk"} />
          ))}
        </div>

        {report.recommendations?.length ? (
          <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: "rgba(180,139,62,0.10)", border: "1px solid rgba(180,139,62,0.30)", color: "#5C4117" }}>
            <div className="font-semibold mb-1">Recommendations</div>
            <ul className="list-disc list-inside space-y-1">
              {report.recommendations.slice(0, 4).map((r: any, i: number) => (
                <li key={i}>{r.action}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: "rgba(123,142,88,0.12)", border: "1px solid rgba(123,142,88,0.32)", color: "var(--pq-deep)" }}>
            <div className="font-semibold mb-0.5">All clear ✓</div>
            <div className="text-xs">Deck meets every boardroom rule. Ready to export.</div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Row({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const v = Math.round(value);
  const display = invert ? Math.max(0, 100 - v) : v;
  const tone =
    display >= 90 ? "linear-gradient(90deg,#7B8E58,#425722)" :
    display >= 75 ? "linear-gradient(90deg,#D8B265,#B68B3E)" :
                    "linear-gradient(90deg,#E89B8B,#D26C58)";
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between">
        <span className="text-zinc-700">{label}</span>
        <span className="font-semibold text-zinc-700">{display}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(66,87,34,0.10)" }}>
        <div className="h-full" style={{ width: `${display}%`, background: tone }} />
      </div>
    </div>
  );
}
