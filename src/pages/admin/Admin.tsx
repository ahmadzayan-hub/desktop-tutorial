import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Package, UserPlus, ClipboardCheck, Building2, Boxes,
  ArrowLeft, TrendingUp, CheckCircle2, Clock,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BrandMark } from "@/components/BrandMark";
import { formatAed } from "@/lib/format";
import {
  DEMO_ORDERS, DEMO_LEADS, DEMO_CORP, DEMO_INVENTORY, REVENUE_SERIES, FUNNEL,
} from "@/lib/demoData";
import { RevenueBars, Funnel, StatusBars } from "./charts";

type Tab = "overview" | "orders" | "leads" | "approvals" | "corporate" | "inventory";

const TABS: { id: Tab; key: string; Icon: typeof Package }[] = [
  { id: "overview", key: "admin.nav.overview", Icon: LayoutDashboard },
  { id: "orders", key: "admin.nav.orders", Icon: Package },
  { id: "leads", key: "admin.nav.leads", Icon: UserPlus },
  { id: "approvals", key: "admin.nav.approvals", Icon: ClipboardCheck },
  { id: "corporate", key: "admin.nav.corporate", Icon: Building2 },
  { id: "inventory", key: "admin.nav.inventory", Icon: Boxes },
];

export default function Admin() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("overview");
  const [approved, setApproved] = useState<Set<string>>(new Set());

  const kpis = useMemo(() => {
    const revenueToday = REVENUE_SERIES[REVENUE_SERIES.length - 1];
    const revenue7d = REVENUE_SERIES.slice(-7).reduce((a, b) => a + b, 0);
    const awaiting = DEMO_ORDERS.filter((o) => o.payment === "awaiting" || o.payment === "link_sent").reduce((s, o) => s + o.total, 0);
    const pendingApprovals = DEMO_ORDERS.filter((o) => o.approval === "pending" && !approved.has(o.ref)).length;
    const inProduction = DEMO_ORDERS.filter((o) => o.production !== "ready").length;
    const outForDelivery = DEMO_ORDERS.filter((o) => o.delivery === "out").length;
    const conversion = Math.round((FUNNEL[3].value / FUNNEL[1].value) * 100);
    return { revenueToday, revenue7d, awaiting, openLeads: DEMO_LEADS.length, pendingApprovals, inProduction, outForDelivery, conversion };
  }, [approved]);

  return (
    <div className="min-h-dvh bg-cream">
      <Seo title={t("admin.title")} />

      {/* Console top bar */}
      <header className="sticky top-0 z-30 border-b border-coffee-100 bg-white/90 backdrop-blur">
        <div className="container-max flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <div>
              <p className="text-sm font-bold text-coffee-900">{t("admin.title")}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                {t("admin.demoBadge")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden sm:inline-flex" />
            <Link to="/" className="btn btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" /> {t("common.backHome")}</Link>
          </div>
        </div>
      </header>

      <div className="container-max py-6">
        {/* Tabs */}
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-coffee-100 bg-white p-1.5 shadow-soft">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                tab === tb.id ? "bg-coffee-700 text-cream-50" : "text-coffee-600 hover:bg-coffee-50"
              }`}
            >
              <tb.Icon className="h-4 w-4" /> {t(tb.key)}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === "overview" && <Overview kpis={kpis} />}
          {tab === "orders" && <Orders />}
          {tab === "leads" && <Leads />}
          {tab === "approvals" && <Approvals approved={approved} setApproved={setApproved} />}
          {tab === "corporate" && <CorporateInq />}
          {tab === "inventory" && <Inventory />}
        </div>

        <p className="mt-8 rounded-xl bg-cream-50 p-3 text-center text-xs text-coffee-400">{t("admin.signInHint")}</p>
      </div>
    </div>
  );
}

/* ------------------------------- Overview ------------------------------- */
function Overview({ kpis }: { kpis: Record<string, number> }) {
  const { t, lang } = useI18n();
  const cards = [
    { key: "revenueToday", value: formatAed(kpis.revenueToday, lang), Icon: TrendingUp },
    { key: "revenue7d", value: formatAed(kpis.revenue7d, lang), Icon: TrendingUp },
    { key: "awaitingPayment", value: formatAed(kpis.awaiting, lang), Icon: Clock },
    { key: "openLeads", value: String(kpis.openLeads), Icon: UserPlus },
    { key: "pendingApprovals", value: String(kpis.pendingApprovals), Icon: ClipboardCheck },
    { key: "inProduction", value: String(kpis.inProduction), Icon: Package },
    { key: "outForDelivery", value: String(kpis.outForDelivery), Icon: Package },
    { key: "conversion", value: `${kpis.conversion}%`, Icon: TrendingUp },
  ];

  const payment = countBy(DEMO_ORDERS.map((o) => o.payment));
  const production = countBy(DEMO_ORDERS.map((o) => o.production));
  const delivery = countBy(DEMO_ORDERS.map((o) => o.delivery));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.key} className="rounded-2xl border border-coffee-100 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-coffee-500">{t(`admin.kpi.${c.key}`)}</span>
              <c.Icon className="h-4 w-4 text-gold-500" />
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-coffee-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-soft lg:col-span-2">
          <h3 className="mb-4 font-semibold text-coffee-900">{t("admin.revenueTrend")}</h3>
          <RevenueBars data={REVENUE_SERIES} />
        </div>
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-soft">
          <h3 className="mb-4 font-semibold text-coffee-900">{t("admin.funnel")}</h3>
          <Funnel data={FUNNEL} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard title={t("admin.statusPayment")} items={[
          { label: t("admin.status.paid"), value: payment.paid ?? 0, tone: "bg-green-500" },
          { label: t("admin.status.awaiting"), value: (payment.awaiting ?? 0) + (payment.link_sent ?? 0), tone: "bg-amber-500" },
          { label: t("admin.status.cod"), value: payment.cod ?? 0, tone: "bg-sky-500" },
        ]} />
        <StatusCard title={t("admin.statusProduction")} items={[
          { label: t("admin.status.queued"), value: production.queued ?? 0, tone: "bg-coffee-300" },
          { label: t("admin.status.printing"), value: production.printing ?? 0, tone: "bg-gold-500" },
          { label: t("admin.status.packing"), value: production.packing ?? 0, tone: "bg-coffee-500" },
          { label: t("admin.status.ready"), value: production.ready ?? 0, tone: "bg-green-500" },
        ]} />
        <StatusCard title={t("admin.statusDelivery")} items={[
          { label: t("admin.status.scheduled"), value: delivery.scheduled ?? 0, tone: "bg-coffee-400" },
          { label: t("admin.status.out"), value: delivery.out ?? 0, tone: "bg-gold-500" },
          { label: t("admin.status.delivered"), value: delivery.delivered ?? 0, tone: "bg-green-500" },
        ]} />
      </div>
    </div>
  );
}

function StatusCard({ title, items }: { title: string; items: { label: string; value: number; tone: string }[] }) {
  return (
    <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-soft">
      <h3 className="mb-4 font-semibold text-coffee-900">{title}</h3>
      <StatusBars items={items} />
    </div>
  );
}

/* ------------------------------- Orders ------------------------------- */
function Orders() {
  const { t, lang, pick } = useI18n();
  return (
    <TableCard title={t("admin.recentOrders")}>
      <thead><Tr head cols={[t("admin.colOrder"), t("admin.colCustomer"), t("admin.colItem"), t("admin.colTotal"), t("admin.colPayment"), t("admin.colProduction"), t("admin.colDelivery")]} /></thead>
      <tbody className="divide-y divide-coffee-100">
        {DEMO_ORDERS.map((o) => (
          <tr key={o.ref} className="text-sm">
            <td className="px-4 py-3 font-medium text-coffee-900">{o.ref}</td>
            <td className="px-4 py-3 text-coffee-700">{o.customer}</td>
            <td className="px-4 py-3 text-coffee-600">{pick(o.item)}</td>
            <td className="px-4 py-3 text-coffee-800">{formatAed(o.total, lang)}</td>
            <td className="px-4 py-3"><Badge tone={o.payment === "paid" ? "green" : o.payment === "cod" ? "sky" : "amber"}>{t(`admin.status.${o.payment}`)}</Badge></td>
            <td className="px-4 py-3"><Badge tone={o.production === "ready" ? "green" : "coffee"}>{t(`admin.status.${o.production}`)}</Badge></td>
            <td className="px-4 py-3"><Badge tone={o.delivery === "delivered" ? "green" : o.delivery === "out" ? "gold" : "coffee"}>{t(`admin.status.${o.delivery}`)}</Badge></td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}

/* ------------------------------- Leads ------------------------------- */
function Leads() {
  const { t, pick } = useI18n();
  return (
    <TableCard title={t("admin.nav.leads")}>
      <thead><Tr head cols={[t("admin.colCustomer"), t("admin.colChannel"), t("admin.colInterest"), t("admin.colStatus"), t("admin.colWhen")]} /></thead>
      <tbody className="divide-y divide-coffee-100">
        {DEMO_LEADS.map((l, i) => (
          <tr key={i} className="text-sm">
            <td className="px-4 py-3 font-medium text-coffee-900">{l.name}</td>
            <td className="px-4 py-3 text-coffee-600">{pick(l.channel)}</td>
            <td className="px-4 py-3 text-coffee-600">{pick(l.interest)}</td>
            <td className="px-4 py-3"><Badge tone={l.temp === "hot" ? "gold" : l.temp === "warm" ? "amber" : "coffee"}>{t(`admin.status.${l.temp}`)}</Badge></td>
            <td className="px-4 py-3 text-xs text-coffee-400">{l.ageHours}h</td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}

/* ------------------------------- Approvals ------------------------------- */
function Approvals({ approved, setApproved }: { approved: Set<string>; setApproved: (s: Set<string>) => void }) {
  const { t, pick } = useI18n();
  const pending = DEMO_ORDERS.filter((o) => o.approval === "pending");
  return (
    <TableCard title={t("admin.nav.approvals")}>
      <thead><Tr head cols={[t("admin.colOrder"), t("admin.colCustomer"), t("admin.colItem"), t("admin.colStatus"), ""]} /></thead>
      <tbody className="divide-y divide-coffee-100">
        {pending.map((o) => {
          const isApproved = approved.has(o.ref);
          return (
            <tr key={o.ref} className="text-sm">
              <td className="px-4 py-3 font-medium text-coffee-900">{o.ref}</td>
              <td className="px-4 py-3 text-coffee-700">{o.customer}</td>
              <td className="px-4 py-3 text-coffee-600">{pick(o.item)}</td>
              <td className="px-4 py-3"><Badge tone={isApproved ? "green" : "amber"}>{isApproved ? t("admin.approved") : t("admin.pending")}</Badge></td>
              <td className="px-4 py-3 text-end">
                {!isApproved && (
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={() => setApproved(new Set([...approved, o.ref]))}
                  >
                    <CheckCircle2 className="h-4 w-4" /> {t("admin.approve")}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableCard>
  );
}

/* ------------------------------- Corporate ------------------------------- */
function CorporateInq() {
  const { t, lang, pick } = useI18n();
  return (
    <TableCard title={t("admin.nav.corporate")}>
      <thead><Tr head cols={[t("admin.colCompany"), t("admin.colEvent"), t("admin.colGuests"), t("admin.colValue"), t("admin.colStatus"), t("admin.colWhen")]} /></thead>
      <tbody className="divide-y divide-coffee-100">
        {DEMO_CORP.map((c, i) => (
          <tr key={i} className="text-sm">
            <td className="px-4 py-3 font-medium text-coffee-900">{c.company}</td>
            <td className="px-4 py-3 text-coffee-600">{pick(c.event)}</td>
            <td className="px-4 py-3 text-coffee-700">{c.guests}</td>
            <td className="px-4 py-3 text-coffee-800">{formatAed(c.value, lang)}</td>
            <td className="px-4 py-3 text-coffee-600">{pick(c.status)}</td>
            <td className="px-4 py-3 text-xs text-coffee-400">{c.ageHours}h</td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}

/* ------------------------------- Inventory ------------------------------- */
function Inventory() {
  const { t, pick } = useI18n();
  return (
    <TableCard title={t("admin.nav.inventory")}>
      <thead><Tr head cols={[t("admin.colItem"), t("admin.colStock"), t("admin.colReorder"), t("admin.colStatus")]} /></thead>
      <tbody className="divide-y divide-coffee-100">
        {DEMO_INVENTORY.map((it, i) => {
          const low = it.stock <= it.reorder;
          return (
            <tr key={i} className="text-sm">
              <td className="px-4 py-3 font-medium text-coffee-900">{pick(it.item)}</td>
              <td className="px-4 py-3 text-coffee-700">{it.stock.toLocaleString()}</td>
              <td className="px-4 py-3 text-coffee-500">{it.reorder}</td>
              <td className="px-4 py-3"><Badge tone={low ? "amber" : "green"}>{low ? t("admin.reorder") : t("admin.ok")}</Badge></td>
            </tr>
          );
        })}
      </tbody>
    </TableCard>
  );
}

/* ------------------------------- Primitives ------------------------------- */
function TableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-coffee-100 bg-white shadow-soft">
      <div className="border-b border-coffee-100 px-5 py-3.5">
        <h3 className="font-semibold text-coffee-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">{children}</table>
      </div>
    </div>
  );
}

function Tr({ head, cols }: { head?: boolean; cols: string[] }) {
  return (
    <tr className={head ? "bg-cream-50 text-xs font-semibold uppercase tracking-wide text-coffee-400" : ""}>
      {cols.map((c, i) => (
        <th key={i} className="px-4 py-3 text-start">{c}</th>
      ))}
    </tr>
  );
}

const TONES: Record<string, string> = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  gold: "bg-gold-500/15 text-gold-600",
  sky: "bg-sky-50 text-sky-700",
  coffee: "bg-coffee-50 text-coffee-600",
};
function Badge({ tone, children }: { tone: keyof typeof TONES | string; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TONES[tone] ?? TONES.coffee}`}>{children}</span>;
}

function countBy<T extends string>(arr: T[]): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, k) => {
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}
