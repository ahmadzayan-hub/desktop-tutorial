import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';

const RulesSchema = z.object({
  vatRatePct: z.number().min(0).max(100),
  vatModeDefault: z.enum(['EXCLUSIVE', 'INCLUSIVE', 'NONE']),
  deliveryStandard: z.number().min(0),
  deliveryRemote: z.number().min(0),
  packagingDefault: z.number().min(0),
  marketingDefault: z.number().min(0),
  operationsDefault: z.number().min(0),
  paymentFeeDefaultPct: z.number().min(0).max(30),
  codFee: z.number().min(0),
  targetMarginPct: z.number().min(0).max(500),
  minMarginPct: z.number().min(0).max(500),
  rateMaxAgeHours: z.number().min(1),
  quoteValidityHours: z.number().min(1),
  roundingLadder: z.array(z.number().positive()).min(1),
  bundle2DiscountPct: z.number().min(0).max(50),
  bundle3DiscountPct: z.number().min(0).max(50),
  wholesaleMarginPct: z.number().min(0).max(500),
  premiumUpliftPct: z.number().min(0).max(200),
  approvalThresholdAed: z.number().min(0),
});

export async function GET() {
  try {
    requireRole('VIEWER');
    const rules = await prisma.businessRules.findUnique({ where: { id: 'default' } });
    return NextResponse.json({ rules });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('ADMIN');
    const body = RulesSchema.parse(await req.json());
    if (body.minMarginPct > body.targetMarginPct) {
      return NextResponse.json({ error: 'Minimum margin cannot exceed target margin' }, { status: 400 });
    }
    const before = await prisma.businessRules.findUnique({ where: { id: 'default' } });
    const saved = await prisma.businessRules.upsert({
      where: { id: 'default' },
      update: { ...body, roundingLadder: JSON.stringify(body.roundingLadder) },
      create: { id: 'default', ...body, roundingLadder: JSON.stringify(body.roundingLadder) },
    });
    await audit(session.userId, 'BusinessRules', 'default', 'UPDATE', { before, after: saved });
    return NextResponse.json({ rules: saved });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
