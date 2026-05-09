import { z } from "zod";
import { fail, json } from "@/lib/presentiq/api/response";
import { recordFeedback } from "@/lib/presentiq/demo/store";

const Schema = z.object({
  email: z.string().email().max(200),
  subject: z.string().min(2).max(200),
  message: z.string().min(5).max(4000),
  source: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail("invalid_input", "validation failed", 400, parsed.error.issues);

  const row = recordFeedback({
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    source: parsed.data.source ?? "platform",
  });

  // In production, this would queue to Resend/Postmark and notify Ahmad@outlook.com.
  // For now, record in memory + log so feedback is captured server-side.
  console.log(JSON.stringify({
    type: "presentiq.feedback",
    forwardTo: "Ahmad.zaian@outlook.com",
    feedback: row,
  }));

  return json({ ok: true, id: row.id });
}
