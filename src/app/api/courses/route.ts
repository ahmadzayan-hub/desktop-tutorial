import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";
import { demoReturn } from "@/lib/demo";
import { z } from "zod";

const CourseSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(20).optional(),
  instructor: z.string().max(100).optional(),
  credits: z.number().int().min(0).max(12).optional(),
  color: z.string().max(20).optional(),
  starred: z.boolean().optional(),
});

export async function GET() {
  const demo = demoReturn("courses"); if (demo) return demo;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("starred", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CourseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ id: `course-${Date.now()}`, user_id: "demo-user", ...parsed.data, created_at: new Date().toISOString() }, { status: 201 });
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
