import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";
import { demoReturn } from "@/lib/demo";
import { z } from "zod";

const GradeSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  score: z.number().min(0).max(100),
  max_score: z.number().min(1).max(100).optional(),
  type: z.enum(["quiz", "assignment", "midterm", "final", "project", "other"]).optional(),
  graded_at: z.string().datetime().optional(),
});

export async function GET() {
  const demo = demoReturn("grades"); if (demo) return demo;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const { data, error } = await supabase.from("grades").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = GradeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ id: `gr-${Date.now()}`, user_id: "demo-user", ...parsed.data, created_at: new Date().toISOString() }, { status: 201 });
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("grades").insert({ ...parsed.data, user_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
