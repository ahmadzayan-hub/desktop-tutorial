import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireUserOrg } from "@/lib/services/auth";
import { safeRoute } from "@/lib/api-helpers";

const Body = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid(),
        answer: z.string().min(1).max(4000)
      })
    )
    .min(1)
});

export const POST = safeRoute(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const auth = await requireUserOrg(req.headers.get("x-org-id"));
  if (auth instanceof NextResponse) return auth;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = getServerSupabase();

  // Verify session belongs to org
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", auth.orgId)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Security: verify every submitted question_id actually belongs to this session
  // so a caller cannot inject answers into another session's questions.
  const submittedIds = parsed.data.answers.map((a) => a.question_id);
  const { data: validQuestions } = await supabase
    .from("questions")
    .select("id, required")
    .eq("session_id", params.id)
    .in("id", submittedIds);
  const validIds = new Set((validQuestions ?? []).map((q) => q.id));
  const invalidIds = submittedIds.filter((id) => !validIds.has(id));
  if (invalidIds.length > 0) {
    return NextResponse.json({ error: "invalid_question_ids", ids: invalidIds }, { status: 400 });
  }

  // Verify all required questions for this session have received answers
  const { data: allQuestions } = await supabase
    .from("questions")
    .select("id, required")
    .eq("session_id", params.id);
  const requiredIds = (allQuestions ?? []).filter((q) => q.required).map((q) => q.id);
  const missingRequired = requiredIds.filter((id) => !validIds.has(id));
  if (missingRequired.length > 0) {
    return NextResponse.json({ error: "missing_required_answers", ids: missingRequired }, { status: 400 });
  }

  const rows = parsed.data.answers.map((a) => ({
    question_id: a.question_id,
    session_id: params.id,
    org_id: auth.orgId,
    answer: a.answer
  }));

  const { error } = await supabase.from("answers").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark session ready — only after successful insert
  const { error: updateErr } = await supabase
    .from("sessions")
    .update({ status: "ready" })
    .eq("id", params.id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: rows.length });
});
