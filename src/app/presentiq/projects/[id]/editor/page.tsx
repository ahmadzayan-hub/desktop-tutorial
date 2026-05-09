import { headers } from "next/headers";
import { Editor } from "./Editor";

async function fetchProject(id: string) {
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/presentiq/projects/${id}`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditorPage({ params }: { params: { id: string } }) {
  const data = await fetchProject(params.id);
  if (!data) return <div className="text-sm text-zinc-500">Project not found.</div>;
  return <Editor projectId={params.id} initialSlides={data.slides ?? []} title={data.project.title} />;
}
