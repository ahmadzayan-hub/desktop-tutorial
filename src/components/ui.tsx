import clsx from "clsx";

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-cream/60 pb-4">
      <div>
        <h1 className="display-face text-2xl font-semibold tracking-tight text-gray-900 md:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="muted mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function DemoBanner({ demoMode }: { demoMode: boolean }) {
  if (!demoMode) return null;
  return (
    <div className="card-accent mb-4 flex items-start gap-3 text-sm">
      <span className="badge badge-vip">DEMO</span>
      <div className="flex-1 text-gray-800">
        <strong>Demo mode</strong> — sample customers, orders, payments &amp; reviews so you can explore
        every feature instantly. Connect Supabase (see <code>README</code>) to switch to live data.
      </div>
    </div>
  );
}

export function Kpi({
  label, value, hint, trend,
}: { label: string; value: string | number; hint?: string; trend?: { up?: boolean; text: string } }) {
  return (
    <div className="card">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {trend && (
          <span className={clsx("text-xs font-medium", trend.up ? "text-green-700" : "text-red-700")}>
            {trend.up ? "▲" : "▼"} {trend.text}
          </span>
        )}
      </div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
}

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
  const label = STAGE_LABEL[stage] ?? stage;
  return <span className="badge badge-neutral">{label}</span>;
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

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="h2">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
      <div className="font-medium text-gray-700">{title}</div>
      {hint && <div className="mt-1">{hint}</div>}
    </div>
  );
}
