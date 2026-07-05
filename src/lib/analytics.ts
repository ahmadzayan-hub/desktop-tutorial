// Pure read-side aggregations used by the dashboard + reports pages.
// Works on the demo universe by default; pages that fetch from Supabase pass in
// rows of the same shape.

import { tallyBy, tallyToArray, dayKey, inWindow } from "./agg";

const DAY = 86_400_000;

type Order = Record<string, unknown> & {
  created_at: string;
  total_amount?: number;
  product_name?: string;
  product_category?: string;
  order_status?: string;
  payment_status?: string;
  delivery_area?: string;
};
type Conversation = Record<string, unknown> & {
  created_at: string;
  stage?: string;
  lead_temperature?: string;
  platform?: string;
};

function shortDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AE", { day: "2-digit", month: "short" });
}

/** Empty `days`-long day-by-day series, keyed by yyyy-mm-dd. */
function emptySeries<V>(days: number, init: () => V): Map<string, V> {
  const out = new Map<string, V>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY);
    out.set(d.toISOString().slice(0, 10), init());
  }
  return out;
}

export function revenueByDay(orders: Order[], days = 14) {
  const cutoff = Date.now() - (days - 1) * DAY;
  const out = emptySeries<number>(days, () => 0);
  for (const o of orders) {
    if (o.payment_status !== "confirmed") continue;
    if (!inWindow(o.created_at, cutoff)) continue;
    const k = dayKey(o.created_at);
    if (!out.has(k)) continue;
    out.set(k, (out.get(k) ?? 0) + (Number(o.total_amount) || 0));
  }
  return Array.from(out.entries()).map(([d, aed]) => ({ day: shortDay(d), aed: Math.round(aed) }));
}

export function ordersByDay(orders: Order[], days = 14) {
  const out = emptySeries<number>(days, () => 0);
  for (const o of orders) {
    const k = dayKey(o.created_at);
    if (out.has(k)) out.set(k, (out.get(k) ?? 0) + 1);
  }
  return Array.from(out.entries()).map(([d, ordersN]) => ({ day: shortDay(d), orders: ordersN }));
}

export function stackedStatusByDay(orders: Order[], days = 14) {
  const init = emptySeries<{ paid: number; pending: number; complaints: number }>(days, () => ({
    paid: 0, pending: 0, complaints: 0,
  }));
  for (const o of orders) {
    const cell = init.get(dayKey(o.created_at));
    if (!cell) continue;
    if (o.order_status === "complaint") cell.complaints += 1;
    else if (o.payment_status === "confirmed") cell.paid += 1;
    else if (o.payment_status === "link_sent" || o.payment_status === "needs_verification") cell.pending += 1;
  }
  return Array.from(init.entries()).map(([d, v]) => ({ day: shortDay(d), ...v }));
}

export function conversionFunnel(conversations: Conversation[], orders: Order[]) {
  const total = conversations.length;
  const price = conversations.filter((c) => c.stage === "price_lead").length;
  const warm = conversations.filter((c) => c.stage === "warm_lead").length;
  const hot = conversations.filter((c) => c.stage === "hot_lead" || c.lead_temperature === "hot").length;
  const paid = orders.filter((o) => o.payment_status === "confirmed").length;
  const delivered = orders.filter((o) => o.order_status === "delivered").length;
  return [
    { stage: "All leads", value: total },
    { stage: "Asked price", value: price + warm + hot },
    { stage: "Hot lead", value: hot + paid },
    { stage: "Paid", value: paid },
    { stage: "Delivered", value: delivered },
  ];
}

export function topProducts(orders: Order[], n = 6) {
  const tally = tallyBy(
    orders.filter((o) => o.payment_status === "confirmed"),
    (o) => (o.product_name as string) ?? "(unknown)",
    (o) => Number(o.quantity) || 1,
  );
  return tallyToArray(tally, "name", "orders")
    .sort((a, b) => b.orders - a.orders)
    .slice(0, n);
}

export function platformMix(conversations: Conversation[]) {
  const tally = tallyBy(conversations, (c) => (c.platform as string) ?? "other");
  return tallyToArray(tally);
}

export function emirateMix(orders: Order[]) {
  const tally = tallyBy(
    orders.filter((o) => o.payment_status === "confirmed"),
    (o) => (o.delivery_area as string) ?? "(unknown)",
  );
  return tallyToArray(tally).sort((a, b) => b.value - a.value);
}

export interface AttentionItem {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  href: string;
}

export function buildAttentionQueue(args: {
  orders: Order[];
  payments: Array<Record<string, unknown>>;
  disputes: Array<Record<string, unknown>>;
  inventory: Array<Record<string, unknown>>;
  conversations: Conversation[];
}): AttentionItem[] {
  const out: AttentionItem[] = [];
  // 1. Open disputes block dispatch.
  for (const d of args.disputes) {
    if (d.status === "open" || d.status === "in_review") {
      out.push({
        id: `dispute-${d.id}`,
        severity: "high",
        title: `Dispute: ${(d.reason as string).replace(/_/g, " ")}`,
        detail: `${d.customer_name} — order ${d.order_id}`,
        href: `/payments`,
      });
    }
  }
  // 2. Pending payment verifications.
  for (const p of args.payments) {
    if (p.status === "needs_verification") {
      out.push({
        id: `pay-${p.id}`,
        severity: "high",
        title: `Verify payment — AED ${p.amount_expected}`,
        detail: `${p.customer_name} · ref ${p.reference}`,
        href: `/payments`,
      });
    }
  }
  // 3. Orders in QC.
  for (const o of args.orders) {
    if (o.order_status === "qc") {
      out.push({
        id: `qc-${o.id}`,
        severity: "medium",
        title: `Run QC — ${o.product_summary}`,
        detail: `${o.customer_name} · ${o.delivery_area}`,
        href: `/orders`,
      });
    }
  }
  // 4. Hot leads with no payment yet.
  for (const c of args.conversations) {
    if (c.stage === "hot_lead") {
      out.push({
        id: `hot-${c.id}`,
        severity: "medium",
        title: `Hot lead — draft reply`,
        detail: `${(c as Record<string, unknown>).customer_name} on ${c.platform}`,
        href: `/inbox`,
      });
    }
  }
  // 5. Low / critical inventory.
  for (const inv of args.inventory) {
    const qty = Number(inv.quantity_available) || 0;
    const daily = Number(inv.daily_sales_rate) || 0;
    if (qty === 0) {
      out.push({
        id: `stock-out-${inv.id}`,
        severity: "high",
        title: `Out of stock — ${inv.product_name} (${inv.colour})`,
        detail: `Reorder via ${inv.supplier_source ?? "supplier"}`,
        href: `/inventory`,
      });
    } else if (daily > 0 && qty / daily <= 4) {
      out.push({
        id: `stock-low-${inv.id}`,
        severity: "medium",
        title: `Low stock — ${inv.product_name} (${inv.colour})`,
        detail: `~${Math.floor(qty / daily)} days left at current velocity`,
        href: `/inventory`,
      });
    }
  }
  return out
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1))
    .slice(0, 8);
}
