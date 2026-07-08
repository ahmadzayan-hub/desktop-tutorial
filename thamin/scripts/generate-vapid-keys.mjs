// Generate VAPID keys for Web Push. Run: npm run push:keys
import { generateKeyPairSync } from 'crypto';

const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pub = publicKey.export({ format: 'jwk' });
const priv = privateKey.export({ format: 'jwk' });
const raw = Buffer.concat([
  Buffer.from([4]),
  Buffer.from(pub.x, 'base64url'),
  Buffer.from(pub.y, 'base64url'),
]);

console.log('Add these to your environment (.env / Vercel):\n');
console.log(`VAPID_PUBLIC_KEY="${raw.toString('base64url')}"`);
console.log(`VAPID_PRIVATE_KEY="${priv.d}"`);
console.log('VAPID_SUBJECT="mailto:admin@beyondstyle.ae"');
