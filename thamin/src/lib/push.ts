import { createPrivateKey, sign as cryptoSign } from 'crypto';
import { prisma } from './db';

/**
 * Web Push (VAPID) with zero external dependencies.
 *
 * Pushes are sent WITHOUT a payload (no aes128gcm encryption needed); the
 * service worker shows a fixed "pending approvals" notification and opens
 * the approvals screen on tap. Generate keys once with:
 *   npm run push:keys
 * and set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT.
 */

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function vapidPublicKey(): string {
  return process.env.VAPID_PUBLIC_KEY ?? '';
}

function privateKey() {
  const pub = Buffer.from(process.env.VAPID_PUBLIC_KEY!, 'base64url'); // 0x04 || x || y
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: process.env.VAPID_PRIVATE_KEY!,
    x: pub.subarray(1, 33).toString('base64url'),
    y: pub.subarray(33, 65).toString('base64url'),
  };
  return createPrivateKey({ key: jwk as never, format: 'jwk' });
}

function vapidAuthHeader(endpoint: string): string {
  const aud = new URL(endpoint).origin;
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${enc({ typ: 'JWT', alg: 'ES256' })}.${enc({
    aud,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: process.env.VAPID_SUBJECT || 'mailto:admin@beyondstyle.ae',
  })}`;
  const sig = cryptoSign('sha256', Buffer.from(unsigned), {
    key: privateKey(),
    dsaEncoding: 'ieee-p1363',
  });
  return `vapid t=${unsigned}.${sig.toString('base64url')}, k=${process.env.VAPID_PUBLIC_KEY}`;
}

async function sendEmptyPush(endpoint: string): Promise<number> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      TTL: '86400',
      Urgency: 'normal',
      Authorization: vapidAuthHeader(endpoint),
    },
  });
  return res.status;
}

/**
 * Notify every subscribed manager and admin (e.g. when a product is
 * submitted for approval). Dead subscriptions (404/410) are pruned.
 * Never throws: notification failures must not break the main action.
 */
export async function notifyApprovers(): Promise<{ sent: number; pruned: number }> {
  if (!pushConfigured()) return { sent: 0, pruned: 0 };
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: { role: { in: ['MANAGER', 'ADMIN'] } },
    });
    let sent = 0;
    let pruned = 0;
    for (const s of subs) {
      try {
        const status = await sendEmptyPush(s.endpoint);
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } });
          pruned += 1;
        } else if (status >= 200 && status < 300) {
          sent += 1;
        }
      } catch {
        // network failure for one endpoint must not stop the rest
      }
    }
    return { sent, pruned };
  } catch {
    return { sent: 0, pruned: 0 };
  }
}
