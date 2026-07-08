import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('MANAGER');
    const { id, resolveAll } = await req.json();
    if (resolveAll) {
      const { count } = await prisma.alert.updateMany({
        where: { resolved: false },
        data: { resolved: true },
      });
      await audit(session.userId, 'Alert', null, 'RESOLVE_ALL', { after: { count } });
      return NextResponse.json({ ok: true, count });
    }
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await prisma.alert.update({ where: { id: String(id) }, data: { resolved: true } });
    await audit(session.userId, 'Alert', String(id), 'RESOLVE');
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: 'Failed to resolve alert' }, { status: 500 });
  }
}
