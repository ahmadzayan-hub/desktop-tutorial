import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('VIEWER'); // every signed-in user can change their own password
    const { currentPassword, newPassword } = await req.json();
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !(await bcrypt.compare(String(currentPassword ?? ''), user.passwordHash))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });
    await audit(user.id, 'User', user.id, 'CHANGE_PASSWORD');
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 });
  }
}
