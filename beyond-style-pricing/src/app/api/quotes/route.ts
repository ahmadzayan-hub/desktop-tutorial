import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';
import { loadRules } from '@/lib/rules';

const QuoteSchema = z.object({
  customerName: z.string().nullish(),
  customerPhone: z.string().nullish(),
  channelKey: z.string().nullish(),
  language: z.enum(['en', 'ar']).default('en'),
  vatMode: z.enum(['EXCLUSIVE', 'INCLUSIVE', 'NONE']).default('EXCLUSIVE'),
  deliveryCost: z.number().min(0).default(0),
  deliveryDays: z.string().nullish(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        nameAr: z.string().nullish(),
        qty: z.number().int().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1),
});

export async function GET() {
  try {
    requireRole('VIEWER');
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { createdBy: { select: { name: true } } },
    });
    return NextResponse.json({ quotes });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('SALES');
    const body = QuoteSchema.parse(await req.json());
    const rules = await loadRules();

    const items = body.items.map((i) => ({ ...i, total: Math.round(i.qty * i.unitPrice * 100) / 100 }));
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const vatRate = rules.vatRatePct / 100;
    let vatAmount = 0;
    let total = subtotal + body.deliveryCost;
    if (body.vatMode === 'EXCLUSIVE') {
      vatAmount = Math.round(total * vatRate * 100) / 100;
      total = Math.round((total + vatAmount) * 100) / 100;
    } else if (body.vatMode === 'INCLUSIVE') {
      vatAmount = Math.round(((total * vatRate) / (1 + vatRate)) * 100) / 100;
    }

    const count = await prisma.quote.count();
    const number = `BSQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const validUntil = new Date(Date.now() + rules.quoteValidityHours * 36e5);

    const quote = await prisma.quote.create({
      data: {
        number,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        channelKey: body.channelKey,
        language: body.language,
        itemsJson: JSON.stringify(items),
        subtotal,
        deliveryCost: body.deliveryCost,
        vatAmount,
        vatMode: body.vatMode,
        total,
        validUntil,
        deliveryDays: body.deliveryDays,
        createdById: session.userId,
      },
    });
    await audit(session.userId, 'Quote', quote.id, 'CREATE', { after: { number, total } });
    return NextResponse.json({ quote });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: 'Quote creation failed' }, { status: 500 });
  }
}
