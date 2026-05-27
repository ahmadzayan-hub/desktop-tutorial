import { fetchRows } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await fetchRows("settings", { order: "key" });
  const products = await fetchRows("products", { order: "name" });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-xl font-semibold">Settings</h1>
      <p className="mb-4 text-sm text-gray-500">
        All prices, VAT, reservation windows, and the AI provider are configurable — nothing is
        hard-coded. The AI provider is selected via the <code>AI_PROVIDER</code> env var.
      </p>

      <div className="card mb-4">
        <h2 className="mb-2 text-sm font-semibold">System settings</h2>
        {settings.rows.length === 0 ? (
          <p className="text-sm text-gray-400">No settings rows (connect Supabase & run seed).</p>
        ) : (
          <ul className="text-sm">
            {settings.rows.map((s) => (
              <li key={s.key} className="flex gap-2 py-0.5">
                <span className="w-56 text-gray-500">{s.key}</span>
                <code>{JSON.stringify(s.value)}</code>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold">Product catalogue (configurable)</h2>
        {products.rows.length === 0 ? (
          <p className="text-sm text-gray-400">No products (connect Supabase & run seed).</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="py-1">Product</th>
                <th>Category</th>
                <th>Default price (AED)</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {products.rows.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-1">{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.default_price}</td>
                  <td>{p.active ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
