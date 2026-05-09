import Link from "next/link";
import { headers } from "next/headers";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Badge } from "@/components/presentiq/ui/Badge";

async function fetchProjects() {
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  try {
    const res = await fetch(`${proto}://${host}/api/presentiq/projects`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function Dashboard() {
  const items = await fetchProjects();
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Recent presentations and quick actions.</p>
        </div>
        <Link
          href="/presentiq/projects/new"
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800"
        >
          New presentation
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Boardroom decks YTD", value: items.length },
          { label: "Brand Compliance", value: "—" },
          { label: "Avg readiness", value: "—" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody>
              <div className="text-xs uppercase tracking-wide text-zinc-500">{s.label}</div>
              <div className="text-2xl font-semibold text-zinc-900 mt-2">{s.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Projects" subtitle="Your most recent work" />
        <CardBody>
          {items.length === 0 ? (
            <div className="text-sm text-zinc-500">
              No projects yet.{" "}
              <Link href="/presentiq/projects/new" className="text-zinc-900 underline">
                Create your first
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {items.map((p: any) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/presentiq/projects/${p.id}`} className="font-medium text-zinc-900 hover:underline">
                      {p.title}
                    </Link>
                    <div className="text-xs text-zinc-500 mt-1">
                      {p.presentation_mode} · {p.language_mode}
                    </div>
                  </div>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function statusTone(s: string): "zinc" | "amber" | "green" | "blue" {
  if (s === "ready" || s === "approved" || s === "exported") return "green";
  if (s === "generating" || s === "ingesting") return "amber";
  if (s === "blueprint_ready") return "blue";
  return "zinc";
}
