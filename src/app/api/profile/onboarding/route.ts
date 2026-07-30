export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";
import { z } from "zod";

const OnboardingSchema = z.object({
  full_name: z.string().min(2).max(100),
  program_name: z.string().min(1).max(200).optional(),
  university: z.string().min(1).max(200).optional(),
  gpa_scale: z.number().min(0).max(10).optional(),
  study_hours_per_week: z.number().int().min(0).max(168).optional(),
  primary_language: z.enum(["en", "ar"]).optional(),
  goal: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  const { full_name, ...profile } = parsed.data;

  await supabase.from("users").update({ full_name }).eq("id", user.id);

  await supabase.from("academic_profiles").upsert({
    user_id: user.id,
    ...profile,
    onboarding_completed: true,
  }, { onConflict: "user_id" });

  return NextResponse.json({ ok: true });
}
