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

export default async function ProjectsPage() {
  const items = await fetchProjects();
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <Link
          href="/presentiq/projects/new"
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800"
        >
          New presentation
        </Link>
      </header>
      <Card>
        <CardHeader title="All projects" />
        <CardBody>
          {items.length === 0 ? (
            <div className="text-sm text-zinc-500">No projects yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-zinc-500 text-xs uppercase">
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left">Mode</th>
                  <th className="text-left">Language</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-3">
                      <Link href={`/presentiq/projects/${p.id}`} className="font-medium hover:underline">
                        {p.title}
                      </Link>
                    </td>
                    <td>{p.presentation_mode}</td>
                    <td>{p.language_mode}</td>
                    <td><Badge>{p.status}</Badge></td>
                    <td className="text-zinc-500">{new Date(p.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
