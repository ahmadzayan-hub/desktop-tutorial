export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";
import { demoReturn } from "@/lib/demo";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1).max(300),
  course_id: z.string().uuid().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET() {
  const demo = demoReturn("tasks"); if (demo) return demo;
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { data, error } = await supabase
    .from("tasks")
    .select("*, courses(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const tasks = (data || []).map((t: any) => ({ ...t, course_name: t.courses?.name }));
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = TaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ id: `task-${Date.now()}`, user_id: "demo-user", ...parsed.data, created_at: new Date().toISOString() }, { status: 201 });
  }
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
