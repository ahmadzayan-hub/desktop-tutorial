import { fetchKpis } from "@/lib/data";

export const dynamic = "force-dynamic";

const DAILY_SECTIONS = [
  "What went well", "What failed", "Lost sales reasons", "Pricing issues",
  "Delivery issues", "Payment issues", "Stock issues", "Customer objections",
  "Template improvements", "Product photo improvements", "Next-day action plan",
];

const WEEKLY_SECTIONS = [
  "Best selling products", "Best selling colours", "Best converting scripts",
  "Worst converting scripts", "Courier SLA review", "Supplier risk review",
  "Pricing recommendation", "Inventory reorder recommendation",
  "Content recommendation", "Repeat purchase plan",
];

export default async function ReportsPage() {
  const { kpis } = await fetchKpis();
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-semibold">Reports &amp; Reviews</h1>
      <p className="mb-4 text-sm text-gray-500">
        The improvement loop. Generate the daily review every evening and the weekly review every
        week — without it, the system repeats mistakes faster.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Snap label="Total leads" v={kpis.totalLeads} />
        <Snap label="Hot leads" v={kpis.hotLeads} />
        <Snap label="Paid orders" v={kpis.paidOrders} />
        <Snap label="Lead → payment" v={`${kpis.leadToPayment}%`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 text-sm font-semibold">Daily operating review (§21)</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {DAILY_SECTIONS.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Wire the <code>daily_review</code> prompt + the day&apos;s conversations/orders into the
            AI provider to auto-draft this.
          </p>
        </div>
        <div className="card">
          <h2 className="mb-2 text-sm font-semibold">Weekly improvement loop (§22)</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {WEEKLY_SECTIONS.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Snap({ label, v }: { label: string; v: number | string }) {
  return (
    <div className="card">
      <div className="text-xl font-semibold">{v}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
