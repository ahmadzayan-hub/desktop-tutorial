import { fetchKpis, fetchRows, formatAed, formatRelative } from "@/lib/data";
import { DemoBanner, PageHeader, Kpi, SectionTitle, Stat } from "@/components/ui";
import { OrdersBarChart, RevenueAreaChart, FunnelBarChart, TopProductsChart } from "@/components/LazyCharts";
import { revenueByDay, ordersByDay, conversionFunnel, topProducts } from "@/lib/analytics";
import { buildVatCsv, selectTestimonials, type OrderForTax, type ReviewLike } from "@/lib/growth";
import { computeDailyMetrics, deterministicNarrative } from "@/lib/daily-review";
import Link from "next/link";
import VatExportButton from "./VatExportButton";

export const dynamic = "force-dynamic";

const WEEKLY_SECTIONS = [
  "Best selling products", "Best selling colours", "Best converting scripts",
  "Worst converting scripts", "Courier SLA review", "Supplier risk review",
  "Pricing recommendation", "Inventory reorder recommendation",
  "Content recommendation", "Repeat purchase plan",
];

export default async function ReportsPage() {
  const [{ kpis, demoMode }, ordersRes, convsRes, reviewsRes] = await Promise.all([
    fetchKpis(),
    fetchRows("orders", { order: "created_at" }),
    fetchRows("conversations", { order: "created_at" }),
    fetchRows("reviews", { order: "created_at" }),
  ]);
  const orders = ordersRes.rows as Array<Record<string, unknown> & { created_at: string }>;
  const conversations = convsRes.rows as Array<Record<string, unknown> & { created_at: string }>;
  const reviews = reviewsRes.rows as Array<Record<string, unknown> & { created_at: string }>;
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviewCount) : 0;
  const fiveStar = reviews.filter((r) => Number(r.rating) === 5).length;
  const shareableCount = reviews.filter((r) => r.permission_to_share).length;
  const testimonials = selectTestimonials(reviews as unknown as ReviewLike[], 4);

  const revenue = revenueByDay(orders, 30);
  const ordersTrend = ordersByDay(orders, 30);
  const funnel = conversionFunnel(conversations, orders);
  const top = topProducts(orders);
  const metrics = computeDailyMetrics(orders, conversations);
  const narrative = deterministicNarrative(metrics);
  const csv = buildVatCsv(
    orders
      .filter((o) => o.payment_status === "confirmed")
      .map((o) => ({
        id: o.id as string,
        created_at: o.created_at,
        product_summary: o.product_summary as string,
        product_price: Number(o.product_price),
        delivery_cost: Number(o.delivery_cost),
        vat_amount: Number(o.vat_amount),
        total_amount: Number(o.total_amount),
        payment_status: o.payment_status as string,
      })) as OrderForTax[]
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Insights"
        subtitle="Revenue, funnel, product mix, customer voice, and the daily/weekly improvement loop — one surface for every question you'll ask on Sunday."
        action={<VatExportButton csv={csv} />}
      />
      <DemoBanner demoMode={demoMode} />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Kpi label="Revenue 30d" value={formatAed(kpis.revenueAed30d)} />
        <Kpi label="Revenue 7d" value={formatAed(kpis.revenueAed7d)} />
        <Kpi label="Paid orders" value={kpis.paidOrders} />
        <Kpi label="Lead → payment" value={`${kpis.leadToPayment}%`} />
        <Kpi label="Avg rating" value={avgRating.toFixed(2)} hint={`${reviewCount} reviews`} />
        <Kpi label="Open disputes" value={kpis.openDisputes} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <SectionTitle>Revenue (30 days)</SectionTitle>
          <RevenueAreaChart data={revenue} />
        </div>
        <div className="card">
          <SectionTitle>Conversion funnel</SectionTitle>
          <FunnelBarChart data={funnel} />
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <SectionTitle>Orders per day</SectionTitle>
          <OrdersBarChart data={ordersTrend} />
        </div>
        <div className="card">
          <SectionTitle>Top products (paid)</SectionTitle>
          <TopProductsChart data={top} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <SectionTitle action={<span className="muted text-xs">today, live</span>}>
            Daily operating review
          </SectionTitle>
          <dl className="mb-3 grid grid-cols-2 gap-2 text-sm">
            <Stat k="Conversations" v={metrics.todayConversations} />
            <Stat k="Hot leads" v={metrics.todayHotLeads} />
            <Stat k="Orders" v={metrics.todayOrders} />
            <Stat k="Paid (AED)" v={formatAed(metrics.todayPaidAed)} />
            <Stat k="Pending (AED)" v={formatAed(metrics.todayPendingAed)} />
            <Stat k="Avg order (AED)" v={formatAed(metrics.avgOrderAed)} />
            <Stat k="Conversion" v={`${metrics.conversionPercent}%`} />
            <Stat k="Complaints" v={metrics.todayComplaints} />
          </dl>
          <h3 className="h2 mt-3 mb-1">Narrative — English</h3>
          <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm">{narrative.en}</pre>
          <h3 className="h2 mt-3 mb-1">السرد — العربية</h3>
          <pre className="rtl whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm" dir="rtl">{narrative.ar}</pre>
          <p className="mt-2 text-xs text-gray-500">
            Wire your AI provider (Settings) to polish this narrative every evening from the day&apos;s conversations.
          </p>
        </div>
        <div className="card">
          <SectionTitle>Weekly improvement loop</SectionTitle>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {WEEKLY_SECTIONS.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Run every Sunday. The VAT-ready CSV above feeds the monthly tax report.
          </p>
        </div>
      </div>

      <div id="reviews" className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <SectionTitle
            action={<Link href="/reviews" className="muted text-xs underline">All reviews →</Link>}
          >
            Customer voice
          </SectionTitle>
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <Stat k="Avg rating" v={avgRating.toFixed(2)} />
            <Stat k="5★ count"    v={fiveStar} />
            <Stat k="Reviews"     v={reviewCount} />
            <Stat k="Shareable"   v={shareableCount} />
          </div>
          {testimonials.length === 0 ? (
            <p className="muted text-sm">No share-approved testimonials yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {testimonials.map((t) => (
                <div key={t.id as string} className="card-accent text-sm">
                  <div className="text-xs">{"★".repeat(Number(t.rating) || 0)}</div>
                  <p className="mt-1">“{t.feedback}”</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <SectionTitle>Recent feedback</SectionTitle>
          {reviews.length === 0 ? (
            <p className="muted text-sm">No reviews yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {reviews.slice(0, 6).map((r) => (
                <li key={r.id as string} className="border-l-2 border-[color:rgb(var(--brand)/.4)] pl-3">
                  <div className="text-xs text-[color:rgb(var(--ink-3))]">
                    {"★".repeat(Number(r.rating) || 0)}
                    {" · "}{r.customer_name as string}
                    {" · "}{formatRelative(r.created_at)}
                  </div>
                  <p className="mt-0.5 text-sm">{r.feedback as string}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

