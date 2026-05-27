import { fetchKpis } from "@/lib/data";

export const dynamic = "force-dynamic";

function Kpi({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="card">
      <div className="text-2xl font-semibold">{value}{suffix}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function Dashboard() {
  const { kpis, connected } = await fetchKpis();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-xl font-semibold">Dashboard</h1>
      <p className="mb-4 text-sm text-gray-500">
        Control tower for Beyond Style UAE — conversion, payment, delivery, and margin at a glance.
      </p>

      {!connected && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Supabase is not configured yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and
          <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, run the migration + seed, and KPIs will populate.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Total leads" value={kpis.totalLeads} />
        <Kpi label="New today" value={kpis.newToday} />
        <Kpi label="Price inquiries" value={kpis.priceInquiries} />
        <Kpi label="Hot leads" value={kpis.hotLeads} />
        <Kpi label="Payment links sent" value={kpis.paymentLinksSent} />
        <Kpi label="Paid orders" value={kpis.paidOrders} />
        <Kpi label="Delivered orders" value={kpis.deliveredOrders} />
        <Kpi label="Lost leads" value={kpis.lostLeads} />
        <Kpi label="Complaints" value={kpis.complaints} />
        <Kpi label="Lead → payment" value={kpis.leadToPayment} suffix="%" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 text-sm font-semibold">Operating principle</h2>
          <ol className="list-decimal pl-5 text-sm text-gray-700">
            <li>The agent drafts.</li>
            <li>You approve.</li>
            <li>The system tracks.</li>
            <li>The dashboard learns.</li>
            <li>Automation comes later.</li>
          </ol>
        </div>
        <div className="card">
          <h2 className="mb-2 text-sm font-semibold">Daily discipline</h2>
          <p className="text-sm text-gray-700">
            Run the end-of-day review from <strong>Reports &amp; Reviews</strong> to capture what
            failed, lost-sales reasons, and the next-day plan. Without the loop, the system repeats
            mistakes faster.
          </p>
        </div>
      </div>
    </div>
  );
}
