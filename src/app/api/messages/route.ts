export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";
import { demoReturn, isDemoMode, DEMO_USER } from "@/lib/demo";
import { z } from "zod";

const MessageSchema = z.object({
  to_id: z.string().min(1).max(100),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(5000),
  course_id: z.string().uuid().nullable().optional(),
  course_name: z.string().max(200).optional(),
});

export async function GET() {
  const demo = demoReturn("messages");
  if (demo) return demo;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`to_id.eq.${user.id},from_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  if (isDemoMode) {
    return NextResponse.json({
      id: `msg-${Date.now()}`,
      thread_id: `thread-${Date.now()}`,
      from_id: DEMO_USER.id,
      from_name: "Sara Al-Mansouri",
      from_role: "student",
      ...parsed.data,
      read: true,
      created_at: new Date().toISOString(),
      ai_summary: null,
      ai_reply_suggestion_en: null,
      ai_reply_suggestion_ar: null,
    }, { status: 201 });
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ ...parsed.data, from_id: user.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
