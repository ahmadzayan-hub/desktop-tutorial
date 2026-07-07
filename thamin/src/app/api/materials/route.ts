import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';

const MaterialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().default('gram'),
  ratePerUnit: z.number().min(0, 'Rate cannot be negative'),
  currency: z.string().default('AED'),
  source: z.string().default('manual'),
  riskNote: z.string().nullish(),
});

export async function GET() {
  try {
    requireRole('VIEWER');
    const materials = await prisma.material.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    return NextResponse.json({ materials });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('MANAGER'); // managers/admin update rates
    const body = MaterialSchema.parse(await req.json());
    const { id, ...data } = body;
    let saved;
    if (id) {
      const before = await prisma.material.findUnique({ where: { id } });
      saved = await prisma.material.update({ where: { id }, data: { ...data, manualOverride: true } });
      await audit(session.userId, 'Material', id, 'UPDATE_RATE', { before, after: saved });
    } else {
      saved = await prisma.material.create({ data });
      await audit(session.userId, 'Material', saved.id, 'CREATE', { after: saved });
    }
    return NextResponse.json({ material: saved });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = requireRole('ADMIN');
    const { id } = await req.json();
    await prisma.material.delete({ where: { id } });
    await audit(session.userId, 'Material', id, 'DELETE');
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
