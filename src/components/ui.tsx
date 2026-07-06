import clsx from "clsx";

// ---------- Layout primitives ----------

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="muted mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="h2">{children}</h2>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function DemoBanner({ demoMode }: { demoMode: boolean }) {
  if (!demoMode) return null;
  return (
    <div className="banner banner-demo mb-4">
      <span className="badge badge-vip">DEMO</span>
      <div className="flex-1">
        <strong>Demo mode</strong> · sample customers, orders, payments &amp; reviews. Connect Supabase (see <code>README</code>) to switch to live data.
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <div className="font-medium text-gray-700">{title}</div>
      {hint && <div className="muted mt-1">{hint}</div>}
    </div>
  );
}

// ---------- Data primitives (dedup) ----------

/** A single dt/dd row used inside detail cards. Replaces the 5 private `Row` copies. */
export function KV({ k, v, w = "w-40" }: { k: string; v: React.ReactNode; w?: string }) {
  return (
    <div className="flex gap-2">
      <dt className={clsx("shrink-0 text-gray-500", w)}>{k}</dt>
      <dd className="min-w-0 break-words">{v}</dd>
    </div>
  );
}

/** Compact label-on-top tile used in offer/supplier cards and daily-review grid. */
export function Stat({ k, v, tone = "neutral" }: {
  k: string; v: React.ReactNode; tone?: "neutral" | "danger";
}) {
  return (
    <div className={clsx("stat", tone === "danger" && "stat-danger")}>
      <div className="stat-k">{k}</div>
      <div className="stat-v">{v}</div>
    </div>
  );
}

export function Kpi({
  label, value, hint, trend,
}: { label: string; value: string | number; hint?: string; trend?: { up?: boolean; text: string } }) {
  return (
    <div className="card kpi">
      <div className="flex items-baseline justify-between gap-2">
        <div className="kpi-v">{value}</div>
        {trend && (
          <span className={clsx("text-xs font-medium", trend.up ? "text-emerald-700" : "text-rose-700")}>
            {trend.up ? "▲" : "▼"} {trend.text}
          </span>
        )}
      </div>
      <div className="kpi-l">{label}</div>
      {hint && <div className="kpi-h">{hint}</div>}
    </div>
  );
}

// ---------- Status pill registry ----------
//
// Single source of truth for all status → badge-class maps. Adding a new status
// only requires one edit here instead of hunting across pages.

const STAGE_LABEL: Record<string, string> = {
  cold_lead: "Cold", information_lead: "Info", price_lead: "Price",
  warm_lead: "Warm", hot_lead: "Hot", payment_stage: "Payment",
  delivery_stage: "Delivery", after_sale_stage: "After-sale",
  complaint_stage: "Complaint", supplier_stage: "Supplier", lost_lead: "Lost",
};

const ORDER_STATUS_BADGE: Record<string, string> = {
  draft: "badge-neutral", awaiting_payment: "badge-warn", paid: "badge-info",
  qc: "badge-warn", dispatched: "badge-info", delivered: "badge-pass",
  cancelled: "badge-neutral", complaint: "badge-fail",
};

const PAYMENT_STATUS_BADGE: Record<string, string> = {
  none: "badge-neutral", link_sent: "badge-warn", needs_verification: "badge-warn",
  confirmed: "badge-pass", refunded: "badge-fail",
};

const COURIER_STATUS_BADGE: Record<string, string> = {
  none: "badge-neutral", awaiting_confirmation: "badge-warn", confirmed: "badge-info",
  picked_up: "badge-info", in_transit: "badge-info", delivered: "badge-pass", failed: "badge-fail",
};

const DISPUTE_STATUS_BADGE: Record<string, string> = {
  open: "badge-fail", in_review: "badge-warn", resolved: "badge-pass",
};

export function StagePill({ stage }: { stage: string }) {
  return <span className="badge badge-neutral">{STAGE_LABEL[stage] ?? stage}</span>;
}

export function TempPill({ temp }: { temp: string }) {
  const cls = temp === "hot" ? "badge-hot" : temp === "warm" ? "badge-warm" : "badge-cold";
  return <span className={clsx("badge badge-dot", cls)}>{temp}</span>;
}

export function OrderStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", ORDER_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}
export function PaymentStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", PAYMENT_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}
export function CourierStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", COURIER_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}
export function DisputeStatusPill({ status }: { status: string }) {
  return <span className={clsx("badge", DISPUTE_STATUS_BADGE[status] ?? "badge-neutral")}>{status.replace(/_/g, " ")}</span>;
}
