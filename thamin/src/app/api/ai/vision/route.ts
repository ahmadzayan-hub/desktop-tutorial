import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireRole } from '@/lib/auth';
import { aiConfigured } from '@/lib/ai/client';
import { analyzeProductPhoto } from '@/lib/ai/vision';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    requireRole('SALES');
    if (!aiConfigured()) {
      return NextResponse.json(
        {
          error: 'AI_NOT_CONFIGURED',
          message:
            'AI is not configured. Set AI_BASE_URL / AI_VISION_MODEL in .env (Ollama, vLLM, Groq, Together: any OpenAI-compatible endpoint). You can still price manually with Quick Quote or Advanced Costing.',
        },
        { status: 503 }
      );
    }
    const { image } = await req.json();
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Send { image: "data:image/...;base64,..." }' }, { status: 400 });
    }
    if (image.length > 8_000_000) {
      return NextResponse.json({ error: 'Image too large (max ~6MB). Please compress.' }, { status: 413 });
    }
    const estimate = await analyzeProductPhoto(image);
    return NextResponse.json({ estimate });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Vision analysis failed' }, { status: 500 });
  }
}
