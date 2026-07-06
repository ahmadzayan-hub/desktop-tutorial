// Server-side read helpers. Falls back to a substantial in-memory demo dataset
// when Supabase env is absent, so every page renders meaningful content
// immediately. When Supabase is configured, it queries live tables.
import { createClient, hasSupabaseEnv } from "./supabase/server";
import { buildDemoUniverse, getDemoTable } from "./demo/seed";
import { sumBy, countBy, inWindow, dayWindows, type Row } from "./agg";

export interface FetchOpts {
  limit?: number;
  order?: string;
  /** Optional column filter · e.g. { stage: "hot_lead" }. Only used in demo mode. */
  where?: Record<string, string | number | boolean | null>;
}

export interface FetchResult {
  rows: Row[];
  connected: boolean;
  demoMode: boolean;
  error?: string;
}

export async function fetchRows(table: string, opts: FetchOpts = {}): Promise<FetchResult> {
  if (!hasSupabaseEnv()) {
    let rows = getDemoTable(table);
    if (opts.where) {
      rows = rows.filter((r) =>
        Object.entries(opts.where!).every(([k, v]) => r[k] === v)
      );
    }
    if (opts.order) {
      const key = opts.order;
      rows = [...rows].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return av < bv ? 1 : -1; // desc by default
      });
    }
    if (opts.limit) rows = rows.slice(0, opts.limit);
    return { rows, connected: false, demoMode: true };
  }
  try {
    const supabase = createClient();
    let q = supabase.from(table).select("*").limit(opts.limit ?? 100);
    if (opts.order) q = q.order(opts.order, { ascending: false });
    const { data, error } = await q;
    if (error) return { rows: [], connected: true, demoMode: false, error: error.message };
    return { rows: data ?? [], connected: true, demoMode: false };
  } catch (e) {
    return { rows: [], connected: true, demoMode: false, error: e instanceof Error ? e.message : "query failed" };
  }
}

export interface Kpis {
  totalLeads: number;
  newToday: number;
  priceInquiries: number;
  hotLeads: number;
  paymentLinksSent: number;
  paidOrders: number;
  deliveredOrders: number;
  lostLeads: number;
  complaints: number;
  leadToPayment: number; // %
  revenueAedToday: number;
  revenueAed7d: number;
  revenueAed30d: number;
  pendingPaymentAed: number;
  openDisputes: number;
}

/**
 * Single source of truth for KPI derivation · used by both the demo and the
 * live Supabase paths so we don't repeat the same reducer twice.
 *
 * Live tables select a narrow projection; that projection still matches every
 * field this function reads, so the same code works for both shapes.
 */
export function computeKpis(input: {
  conversations: Row[];
  orders: Row[];
  disputes: Row[];
}): Kpis {
  const { conversations: c, orders: o, disputes: d } = input;
  const { today, d7, d30 } = dayWindows();

  const paid = o.filter((x) => x.payment_status === "confirmed" || x.order_status === "paid");
  const paidToday = paid.filter((x) => inWindow(x.created_at, today));
  const paid7 = paid.filter((x) => inWindow(x.created_at, d7));
  const paid30 = paid.filter((x) => inWindow(x.created_at, d30));

  return {
    totalLeads: c.length,
    newToday: countBy(c, (x) => inWindow(x.created_at, today)),
    priceInquiries: countBy(c, (x) => x.stage === "price_lead"),
    hotLeads: countBy(c, (x) => x.lead_temperature === "hot"),
    paymentLinksSent: countBy(o, (x) => x.payment_status === "link_sent"),
    paidOrders: paid.length,
    deliveredOrders: countBy(o, (x) => x.order_status === "delivered"),
    lostLeads: countBy(c, (x) => x.stage === "lost_lead"),
    complaints: countBy(o, (x) => x.order_status === "complaint"),
    leadToPayment: c.length ? Math.round((paid.length / c.length) * 100) : 0,
    revenueAedToday: Math.round(sumBy(paidToday, (r) => Number(r.total_amount))),
    revenueAed7d: Math.round(sumBy(paid7, (r) => Number(r.total_amount))),
    revenueAed30d: Math.round(sumBy(paid30, (r) => Number(r.total_amount))),
    pendingPaymentAed: Math.round(
      sumBy(
        o.filter((x) => x.payment_status === "link_sent" || x.payment_status === "needs_verification"),
        (r) => Number(r.total_amount),
      ),
    ),
    openDisputes: countBy(d, (x) => x.status === "open" || x.status === "in_review"),
  };
}

export async function fetchKpis(): Promise<{ kpis: Kpis; connected: boolean; demoMode: boolean }> {
  if (!hasSupabaseEnv()) {
    const u = buildDemoUniverse();
    const kpis = computeKpis({
      conversations: u.conversations as Row[],
      orders: u.orders as Row[],
      disputes: u.disputes as Row[],
    });
    return { kpis, connected: false, demoMode: true };
  }

  const supabase = createClient();
  const [convs, orders, disputes] = await Promise.all([
    supabase.from("conversations").select("stage,lead_temperature,intent,created_at"),
    supabase.from("orders").select("order_status,payment_status,total_amount,created_at"),
    supabase.from("disputes").select("status"),
  ]);
  const kpis = computeKpis({
    conversations: (convs.data ?? []) as Row[],
    orders: (orders.data ?? []) as Row[],
    disputes: (disputes.data ?? []) as Row[],
  });
  return { kpis, connected: true, demoMode: false };
}

// ----------------------------- helpers for pages ----------------------------

export function formatAed(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(v);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "·";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "·";
  return d.toLocaleString("en-AE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "·";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-AE", { day: "2-digit", month: "short" });
}
