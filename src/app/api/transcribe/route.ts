import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/demo";
import { requireUser } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

// Demo transcriptions — plausible across Arabic and English locales
const DEMO_TRANSCRIPTS: Record<string, string> = {
  ar: "أريد أن تكتب لي مقالة احترافية عن الذكاء الاصطناعي وتأثيره على سوق العمل في المنطقة العربية، مع التركيز على الفرص والتحديات المستقبلية.",
  en: "Write me a detailed marketing campaign for a sustainable product targeting millennials. Focus on social media engagement, brand storytelling, and a clear call to action across three platforms.",
};

export async function POST(req: NextRequest) {
  // ── Demo mode: return a realistic transcript without calling any API ──
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 700));
    const langHeader = req.headers.get("content-type") ?? "";
    // Peek at the lang field in the form — best effort only
    let lang = "en";
    try {
      const form = await req.formData();
      const raw = form.get("lang") as string | null;
      if (raw?.startsWith("ar")) lang = "ar";
    } catch {
      /* ignore — can't peek into already-consumed body */
    }
    return NextResponse.json({
      transcript: DEMO_TRANSCRIPTS[lang] ?? DEMO_TRANSCRIPTS.en,
    });
  }

  // ── Production: require authenticated user ────────────────────────────
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      { error: "Transcription service is not configured on this server." },
      { status: 503 }
    );
  }

  let audioFile: File | null = null;
  let lang = "en";

  try {
    const form = await req.formData();
    audioFile = form.get("audio") as File | null;
    const rawLang = form.get("lang") as string | null;
    if (rawLang) lang = rawLang.split("-")[0]; // "ar-AE" → "ar"
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to parse request body.", detail: String(e) },
      { status: 400 }
    );
  }

  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json(
      { error: "No audio file received. Please record something first." },
      { status: 400 }
    );
  }

  // Determine file extension so Whisper can detect format correctly
  const mimeType = audioFile.type || "audio/webm";
  const ext = mimeType.includes("mp4") ? "mp4"
            : mimeType.includes("ogg") ? "ogg"
            : mimeType.includes("mpeg") || mimeType.includes("mp3") ? "mp3"
            : "webm";

  try {
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, `recording.${ext}`);
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", lang);
    whisperForm.append("response_format", "json");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: whisperForm,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Transcription API returned an error.", detail },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { text: string };
    const transcript = data.text?.trim() ?? "";

    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected in the recording. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Transcription failed.", detail: String(e) },
      { status: 500 }
    );
  }
}
