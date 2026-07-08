import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AuthError, requireRole } from '@/lib/auth';
import { pushConfigured, vapidPublicKey } from '@/lib/push';

export async function GET() {
  try {
    requireRole('VIEWER');
    return NextResponse.json({ configured: pushConfigured(), publicKey: vapidPublicKey() });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('VIEWER');
    if (!pushConfigured()) {
      return NextResponse.json({ error: 'Push is not configured (VAPID keys missing)' }, { status: 503 });
    }
    const { subscription } = await req.json();
    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userId: session.userId, role: session.role },
      create: { endpoint, p256dh, auth, userId: session.userId, role: session.role },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireRole('VIEWER');
    const { endpoint } = await req.json();
    if (endpoint) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: String(endpoint) } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}
