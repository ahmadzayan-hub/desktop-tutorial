import Link from "next/link";
import { headers } from "next/headers";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Badge } from "@/components/presentiq/ui/Badge";

async function fetchKits() {
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  try {
    const res = await fetch(`${proto}://${host}/api/presentiq/brand-kits`, { headers: { cookie }, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function BrandKitsPage() {
  const items = await fetchKits();
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Brand Kits</h1>
        <Link href="/presentiq/brand-kits/new" className="rounded-xl bg-zinc-900 text-white text-sm px-4 py-2 hover:bg-zinc-800">New brand kit</Link>
      </header>
      <Card>
        <CardHeader title="All kits" />
        <CardBody>
          {items.length === 0 ? (
            <div className="text-sm text-zinc-500">No kits yet.</div>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {items.map((k: any) => (
                <li key={k.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link href={`/presentiq/brand-kits/${k.id}`} className="font-medium hover:underline">{k.name}</Link>
                    <div className="text-xs text-zinc-500 mt-0.5">{Object.keys(k.colors ?? {}).length} colors · {(k.logos ?? []).length} logos</div>
                  </div>
                  {k.is_default && <Badge tone="navy">Default</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
