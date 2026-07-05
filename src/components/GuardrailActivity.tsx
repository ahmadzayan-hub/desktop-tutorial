import Link from "next/link";
import clsx from "clsx";
import { SectionTitle } from "@/components/ui";
import { guardrailStats } from "@/lib/analytics";

type Stats = ReturnType<typeof guardrailStats>;

export default function GuardrailActivity({ stats }: { stats: Stats }) {
  const { total, pass, warn, fail, caught, passRate, byCode, days } = stats;
  const barFail = total ? (fail / total) * 100 : 0;
  const barWarn = total ? (warn / total) * 100 : 0;
  const barPass = total ? (pass / total) * 100 : 100;

  return (
    <div className="card">
      <SectionTitle
        action={
          <Link href="/audit" className="muted text-xs underline">
            Audit trail &rarr;
          </Link>
        }
      >
        Guardrail activity ({days}d)
      </SectionTitle>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Drafts checked" value={total} />
        <MiniStat label="Caught" value={caught} tone={caught ? "warn" : "ok"} hint={`${fail} blocked · ${warn} flagged`} />
        <MiniStat label="Pass rate" value={`${passRate}%`} tone={passRate >= 80 ? "ok" : "warn"} />
      </div>

      {total > 0 && (
        <div className="mt-3">
          <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
            {barFail > 0 && <span className="bg-red-500" style={{ width: `${barFail}%` }} title={`${fail} blocked`} />}
            {barWarn > 0 && <span className="bg-amber-400" style={{ width: `${barWarn}%` }} title={`${warn} flagged`} />}
            {barPass > 0 && <span className="bg-emerald-400" style={{ width: `${barPass}%` }} title={`${pass} clean`} />}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-gray-500">
            <LegendDot color="bg-red-500" text={`${fail} blocked`} />
            <LegendDot color="bg-amber-400" text={`${warn} flagged`} />
            <LegendDot color="bg-emerald-400" text={`${pass} clean`} />
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Top rules hit</p>
        {byCode.length === 0 ? (
          <p className="text-sm text-gray-500">
            Every drafted reply passed the engine this week. Discipline holding.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {byCode.map((c) => {
              const pct = caught ? Math.round((c.count / caught) * 100) : 0;
              return (
                <li key={c.code} className="flex items-center gap-2 text-sm">
                  <span className="w-32 shrink-0 text-gray-700">{c.label}</span>
                  <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <span className="absolute inset-y-0 left-0 bg-pink-400" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-8 shrink-0 text-right text-xs text-gray-500">{c.count}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div
        className={clsx(
          "text-lg font-semibold leading-tight",
          tone === "ok" && "text-emerald-600",
          tone === "warn" && "text-amber-600",
          tone === "neutral" && "text-gray-900",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[10px] text-gray-500">{hint}</div>}
    </div>
  );
}

function LegendDot({ color, text }: { color: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={clsx("inline-block h-2 w-2 rounded-full", color)} />
      {text}
    </span>
  );
}
