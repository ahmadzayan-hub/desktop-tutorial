import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { setSessionCookie, type Role } from '@/lib/auth';

// Basic brute-force protection: 10 failed attempts per identity per 10 minutes.
// In-memory (per serverless instance); move to Redis or DB for multi-instance scale.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; first: number }>();

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) return false;
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else rec.count += 1;
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const key = `${ip}:${String(email).toLowerCase().trim()}`;
  if (tooManyAttempts(key)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 10 minutes.' },
      { status: 429 }
    );
  }
  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    recordFailure(key);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  attempts.delete(key);
  setSessionCookie({ userId: user.id, email: user.email, name: user.name, role: user.role as Role });
  return NextResponse.json({ ok: true, role: user.role, name: user.name });
}
