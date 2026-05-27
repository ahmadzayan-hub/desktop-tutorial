// Server-side read helpers. Degrade gracefully when Supabase env is absent so
// the console renders (with empty data + a connect hint) before configuration.
import { createClient, hasSupabaseEnv } from "./supabase/server";

export async function fetchRows(
  table: string,
  opts: { limit?: number; order?: string } = {}
): Promise<{ rows: any[]; connected: boolean; error?: string }> {
  if (!hasSupabaseEnv()) return { rows: [], connected: false };
  try {
    const supabase = createClient();
    let q = supabase.from(table).select("*").limit(opts.limit ?? 100);
    if (opts.order) q = q.order(opts.order, { ascending: false });
    const { data, error } = await q;
    if (error) return { rows: [], connected: true, error: error.message };
    return { rows: data ?? [], connected: true };
  } catch (e) {
    return { rows: [], connected: true, error: e instanceof Error ? e.message : "query failed" };
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
}

export async function fetchKpis(): Promise<{ kpis: Kpis; connected: boolean }> {
  const empty: Kpis = {
    totalLeads: 0, newToday: 0, priceInquiries: 0, hotLeads: 0,
    paymentLinksSent: 0, paidOrders: 0, deliveredOrders: 0, lostLeads: 0,
    complaints: 0, leadToPayment: 0,
  };
  if (!hasSupabaseEnv()) return { kpis: empty, connected: false };

  const supabase = createClient();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [convs, orders] = await Promise.all([
    supabase.from("conversations").select("stage,lead_temperature,intent,created_at"),
    supabase.from("orders").select("order_status,payment_status"),
  ]);

  const c = convs.data ?? [];
  const o = orders.data ?? [];
  const paid = o.filter((x) => x.payment_status === "confirmed" || x.order_status === "paid").length;

  const kpis: Kpis = {
    totalLeads: c.length,
    newToday: c.filter((x) => new Date(x.created_at) >= today).length,
    priceInquiries: c.filter((x) => x.stage === "price_lead").length,
    hotLeads: c.filter((x) => x.lead_temperature === "hot").length,
    paymentLinksSent: o.filter((x) => x.payment_status === "link_sent").length,
    paidOrders: paid,
    deliveredOrders: o.filter((x) => x.order_status === "delivered").length,
    lostLeads: c.filter((x) => x.stage === "lost_lead").length,
    complaints: o.filter((x) => x.order_status === "complaint").length,
    leadToPayment: c.length ? Math.round((paid / c.length) * 100) : 0,
  };
  return { kpis, connected: true };
}
