import { fetchRows } from "@/lib/data";
import { DEFAULT_PROMPTS } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const { rows, connected } = await fetchRows("prompts", { order: "key" });
  const dbByKey = new Map(rows.map((r) => [r.key, r]));
  const keys = Object.keys(DEFAULT_PROMPTS) as (keyof typeof DEFAULT_PROMPTS)[];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-xl font-semibold">Prompt Management</h1>
      <p className="mb-4 text-sm text-gray-500">
        These prompts drive the agent. Edit them in the <code>prompts</code> table to override the
        code defaults at runtime. {connected ? "" : "(Showing code defaults — Supabase not connected.)"}
      </p>
      <div className="flex flex-col gap-3">
        {keys.map((k) => {
          const db = dbByKey.get(k);
          return (
            <details key={k} className="card">
              <summary className="cursor-pointer text-sm font-semibold">
                {k} {db ? <span className="badge badge-pass ml-2">DB override</span> : <span className="badge badge-warn ml-2">default</span>}
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
                {db?.body ?? DEFAULT_PROMPTS[k]}
              </pre>
            </details>
          );
        })}
      </div>
    </div>
  );
}
