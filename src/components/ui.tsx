import clsx from "clsx";

/* ── Page structure ─────────────────────────────────────────────────── */

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function DemoBanner({ demoMode }: { demoMode: boolean }) {
  if (!demoMode) return null;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm">
      <span className="badge badge-vip shrink-0">DEMO</span>
      <div className="flex-1 text-amber-900">
        <strong>Demo mode</strong> — sample data so you can explore every feature.
        Connect Supabase (see <code className="rounded bg-amber-100 px-1 text-xs">README</code>) to switch to live data.
      </div>
    </div>
  );
}

/* ── KPI tile ─────────────────────────────────────────────────────── */

export function Kpi({
  label, value, hint, trend,
}: { label: string; value: string | number; hint?: string; trend?: { up?: boolean; text: string } }) {
  return (
    <div className="kpi-tile">
      <div className="flex items-baseline justify-between gap-2">
        <div className="kpi-value">{value}</div>
        {trend && (
          <span className={clsx("shrink-0 text-xs font-semibold", trend.up ? "text-emerald-600" : "text-red-500")}>
            {trend.up ? "▲" : "▼"} {trend.text}
          </span>
        )}
      </div>
      <div className="kpi-label">{label}</div>
      {hint && <div className="kpi-hint">{hint}</div>}
    </div>
  );
}

/* ── Stat tile (used in reports daily-review grid) ─────────────────── */

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}

/* ── Section title ──────────────────────────────────────────────────── */

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="h2">{children}</h2>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="text-sm font-medium text-slate-700">{title}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

/* ── Status pills ───────────────────────────────────────────────────── */

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

export function StagePill({ stage }: { stage: string }) {
  return <span className="badge badge-neutral">{STAGE_LABEL[stage] ?? stage}</span>;
}

export function TempPill({ temp }: { temp: string }) {
  const cls = temp === "hot" ? "badge-hot" : temp === "warm" ? "badge-warm" : "badge-cold";
  return <span className={clsx("badge badge-dot", cls)}>{temp}</span>;
}

export function OrderStatusPill({ status }: { status: string }) {
  return (
    <span className={clsx("badge", ORDER_STATUS_BADGE[status] ?? "badge-neutral")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PaymentStatusPill({ status }: { status: string }) {
  return (
    <span className={clsx("badge", PAYMENT_STATUS_BADGE[status] ?? "badge-neutral")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function CourierStatusPill({ status }: { status: string }) {
  return (
    <span className={clsx("badge", COURIER_STATUS_BADGE[status] ?? "badge-neutral")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
