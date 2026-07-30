import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";
import { demoDeadlines } from "@/lib/demo";
import { z } from "zod";

const DeadlineSchema = z.object({
  title: z.string().min(1).max(300),
  course_id: z.string().uuid().nullable().optional(),
  due_date: z.string().datetime(),
  type: z.enum(["assignment", "exam", "quiz", "project", "presentation", "other"]).optional(),
  description: z.string().max(1000).optional(),
  risk: z.enum(["safe", "at_risk", "critical"]).optional(),
});

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view") ?? "week";
  const demo = demoDeadlines(view); if (demo) return demo;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  let q = supabase.from("deadlines").select("*, courses(name)").eq("user_id", user.id).eq("is_done", false).order("due_date");
  if (view === "today") q = q.lte("due_date", new Date(Date.now() + 86400000).toISOString());
  else if (view === "week") q = q.lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString());
  else if (view === "month") q = q.lte("due_date", new Date(Date.now() + 30 * 86400000).toISOString());
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.map((d: any) => ({ ...d, course_name: (d.courses as any)?.name ?? "" })) ?? []);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = DeadlineSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ id: `dl-${Date.now()}`, user_id: "demo-user", risk: "safe", is_done: false, ...parsed.data, created_at: new Date().toISOString() }, { status: 201 });
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("deadlines").insert({ ...parsed.data, user_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
