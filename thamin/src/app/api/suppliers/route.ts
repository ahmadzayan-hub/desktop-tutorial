import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';

const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  country: z.string().nullish(),
  contact: z.string().nullish(),
  materialsSupplied: z.string().nullish(),
  moq: z.string().nullish(),
  deliveryCost: z.number().min(0).nullish(),
  leadTimeDays: z.number().int().min(0).nullish(),
  currency: z.string().default('AED'),
  qualityNotes: z.string().nullish(),
  reliabilityScore: z.number().int().min(1).max(5).nullish(),
});

export async function GET() {
  try {
    requireRole('VIEWER');
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: { quotes: { orderBy: { quotedAt: 'desc' }, take: 5 } },
    });
    return NextResponse.json({ suppliers });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('MANAGER');
    const raw = await req.json();
    if (raw.quote) {
      // add a supplier quote
      const q = await prisma.supplierQuote.create({
        data: {
          supplierId: String(raw.quote.supplierId),
          description: String(raw.quote.description ?? ''),
          amount: Number(raw.quote.amount),
          currency: String(raw.quote.currency ?? 'AED'),
          exchangeRate: Number(raw.quote.exchangeRate ?? 1),
          note: raw.quote.note ? String(raw.quote.note) : undefined,
        },
      });
      return NextResponse.json({ quote: q });
    }
    const body = SupplierSchema.parse(raw);
    const { id, ...data } = body;
    const saved = id
      ? await prisma.supplier.update({ where: { id }, data })
      : await prisma.supplier.create({ data });
    await audit(session.userId, 'Supplier', saved.id, id ? 'UPDATE' : 'CREATE', { after: saved });
    return NextResponse.json({ supplier: saved });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
