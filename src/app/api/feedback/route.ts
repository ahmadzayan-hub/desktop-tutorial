export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const FeedbackSchema = z.object({
  type: z.enum(["bug", "feature", "general", "praise"]).optional(),
  message: z.string().min(1).max(2000),
  page: z.string().max(200).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimit(`feedback:${ip}`, 5, 3_600_000); // 5 per hour per IP
  if (!rl.allowed) return NextResponse.json({ error: "Too many feedback submissions. Try again later." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });

  console.log("Feedback:", parsed.data);
  return NextResponse.json({ ok: true });
}
