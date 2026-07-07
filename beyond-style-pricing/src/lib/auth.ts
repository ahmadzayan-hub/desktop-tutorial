import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './db';

export type Role = 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER';

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

const COOKIE = 'bsp_session';
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.AUTH_SECRET || 'dev-only-secret-change-in-production';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(s: Session): string {
  const body = Buffer.from(
    JSON.stringify({ ...s, exp: Date.now() + MAX_AGE_S * 1000 })
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return verifySessionToken(cookies().get(COOKIE)?.value);
}

export function setSessionCookie(s: Session) {
  cookies().set(COOKIE, createSessionToken(s), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_S,
    path: '/',
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE, '', { maxAge: 0, path: '/' });
}

export const SESSION_COOKIE = COOKIE;

// Role hierarchy: higher index = more privilege
const ORDER: Role[] = ['VIEWER', 'SALES', 'MANAGER', 'ADMIN'];
export function atLeast(role: Role, min: Role): boolean {
  return ORDER.indexOf(role) >= ORDER.indexOf(min);
}

/** Guard for API routes. Throws a Response-like error object when unauthorized. */
export function requireRole(min: Role): Session {
  const s = getSession();
  if (!s) throw new AuthError(401, 'Not authenticated');
  if (!atLeast(s.role, min)) throw new AuthError(403, `Requires ${min} role`);
  return s;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function audit(
  userId: string | null,
  entity: string,
  entityId: string | null,
  action: string,
  opts: { before?: unknown; after?: unknown; reason?: string } = {}
) {
  await prisma.auditLog.create({
    data: {
      entity,
      entityId,
      action,
      userId: userId ?? undefined,
      beforeJson: opts.before ? JSON.stringify(opts.before) : undefined,
      afterJson: opts.after ? JSON.stringify(opts.after) : undefined,
      reason: opts.reason,
    },
  });
}
