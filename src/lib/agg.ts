// Small, dependency-free aggregation helpers reused across pages.
// Pages built their own reducers/tallies inline; centralising them here removes
// the "same reduce three ways" duplication while keeping the call-sites terse.

export type Row = Record<string, unknown>;

const DAY = 86_400_000;

export function sumBy<T>(rows: T[], get: (r: T) => number | null | undefined): number {
  let s = 0;
  for (const r of rows) s += Number(get(r)) || 0;
  return s;
}

export function countBy<T>(rows: T[], pred: (r: T) => unknown): number {
  let n = 0;
  for (const r of rows) if (pred(r)) n++;
  return n;
}

export function tallyBy<T>(rows: T[], key: (r: T) => string | undefined | null, weight: (r: T) => number = () => 1) {
  const out = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    out.set(k, (out.get(k) ?? 0) + weight(r));
  }
  return out;
}

/** Materialise a tally as `{name, value}[]` · the shape recharts/pie/bar want. */
export function tallyToArray(m: Map<string, number>): Array<{ name: string; value: number }>;
/** Custom key names variant (e.g. `{name, orders}` for a bar chart). */
export function tallyToArray<K extends string, V extends string>(
  m: Map<string, number>,
  nameKey: K,
  valueKey: V,
): Array<{ [P in K]: string } & { [P in V]: number }>;
export function tallyToArray(m: Map<string, number>, nameKey = "name", valueKey = "value") {
  return Array.from(m.entries()).map(([n, v]) => ({ [nameKey]: n, [valueKey]: v }));
}

export function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(r);
  }
  return out;
}

/** True when an ISO string parses and is at/after `from` (epoch ms). Safe for unknown. */
export function inWindow(iso: unknown, from: number): boolean {
  if (typeof iso !== "string") return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t >= from;
}

/** Common day windows. `today` is local-midnight epoch ms. */
export function dayWindows(now: number = Date.now()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return {
    today: today.getTime(),
    d7: now - 7 * DAY,
    d30: now - 30 * DAY,
  };
}

/** ISO date `yyyy-mm-dd` slice · used everywhere for day-bucket keys. */
export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}
