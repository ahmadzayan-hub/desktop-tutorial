import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";

export async function GET() {
  const { user, supabase } = await requireUser();
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
  const { user, supabase } = await requireUser();
  const body = await req.json();

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
