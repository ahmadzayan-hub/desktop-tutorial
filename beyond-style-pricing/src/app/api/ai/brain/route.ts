import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AuthError, requireRole } from '@/lib/auth';
import { aiConfigured } from '@/lib/ai/client';
import { runBrainTurn } from '@/lib/ai/brain';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('SALES');
    if (!aiConfigured()) {
      return NextResponse.json(
        {
          error: 'AI_NOT_CONFIGURED',
          message:
            'AI is not configured. Set AI_BASE_URL / AI_TEXT_MODEL in .env (any OpenAI-compatible endpoint: Ollama, vLLM, Groq, Together). The calculator and formula engine work without AI.',
        },
        { status: 503 }
      );
    }
    const { message, conversationId } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // memory: load or create the conversation
    let convo = conversationId
      ? await prisma.brainConversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 30 } },
        })
      : null;
    if (!convo) {
      convo = await prisma.brainConversation.create({
        data: { userId: session.userId, title: message.slice(0, 80) },
        include: { messages: true },
      });
    }

    const history = convo.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const turn = await runBrainTurn(history, message);

    await prisma.brainMessage.createMany({
      data: [
        { conversationId: convo.id, role: 'user', content: message },
        {
          conversationId: convo.id,
          role: 'assistant',
          content: turn.answer,
          toolCallsJson: JSON.stringify(turn.steps),
        },
      ],
    });

    return NextResponse.json({
      answer: turn.answer,
      conversationId: convo.id,
      usedFormulaEngine: turn.usedFormulaEngine,
      steps: turn.steps,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Brain error' }, { status: 500 });
  }
}
