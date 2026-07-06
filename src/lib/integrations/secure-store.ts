// Encrypted cookie token store for OAuth integrations.
//
// Refresh tokens are sensitive, so we never store them in plaintext. This module
// provides AES-256-GCM encrypt/decrypt (pure, testable) plus thin Next.js cookie
// helpers. The console runs single-owner, and storing the encrypted token in an
// httpOnly + secure cookie keeps the OAuth flow fully functional without
// requiring a database table · consistent with the app's "works before Supabase"
// posture. Swap `readTokens`/`saveTokens` for a Supabase-backed store later
// without touching the route handlers.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { OAuthTokens } from "./notebooklm";

const ALGORITHM = "aes-256-gcm";

/**
 * Derive a 32-byte key from the configured secret. Falls back to the Supabase
 * service-role key (already a high-entropy server-only secret) so the store
 * works out of the box, then to a build-time constant for demo/no-secret runs.
 */
function encryptionKey(): Buffer {
  // Fail loudly in production if only the demo fallback is available; a leaked
  // token cookie with a known secret is trivially forgeable. See THREAT_MODEL.md §3.5.
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.INTEGRATION_TOKEN_SECRET &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "INTEGRATION_TOKEN_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set in production.",
    );
  }
  const secret =
    process.env.INTEGRATION_TOKEN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "wasl-demo-integration-secret";
  return createHash("sha256").update(secret).digest();
}

/** Encrypt a UTF-8 string → `iv.tag.ciphertext` (all base64url). */
export function encrypt(plaintext: string, key: Buffer = encryptionKey()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [b64url(iv), b64url(tag), b64url(ciphertext)].join(".");
}

/** Decrypt a payload produced by {@link encrypt}. Returns null if tampered. */
export function decrypt(payload: string, key: Buffer = encryptionKey()): string | null {
  try {
    const [ivPart, tagPart, dataPart] = payload.split(".");
    if (!ivPart || !tagPart || !dataPart) return null;
    const decipher = createDecipheriv(ALGORITHM, key, fromB64url(ivPart));
    decipher.setAuthTag(fromB64url(tagPart));
    const out = Buffer.concat([decipher.update(fromB64url(dataPart)), decipher.final()]);
    return out.toString("utf8");
  } catch {
    return null;
  }
}

const TOKEN_COOKIE = "nblm_tokens";
const STATE_COOKIE = "nblm_oauth_state";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days (refresh tokens are long-lived)

function baseCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

/** Persist tokens (encrypted) in an httpOnly cookie. */
export function saveTokens(tokens: OAuthTokens): void {
  cookies().set(TOKEN_COOKIE, encrypt(JSON.stringify(tokens)), {
    ...baseCookieOptions(),
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Read and decrypt stored tokens, or null when disconnected / invalid. */
export function readTokens(): OAuthTokens | null {
  const raw = cookies().get(TOKEN_COOKIE)?.value;
  if (!raw) return null;
  const json = decrypt(raw);
  if (!json) return null;
  try {
    return JSON.parse(json) as OAuthTokens;
  } catch {
    return null;
  }
}

/** Remove stored tokens. */
export function clearTokens(): void {
  cookies().set(TOKEN_COOKIE, "", { ...baseCookieOptions(), maxAge: 0 });
}

/** Store the anti-CSRF state for the duration of the consent round-trip. */
export function saveState(state: string): void {
  cookies().set(STATE_COOKIE, state, { ...baseCookieOptions(), maxAge: 600 }); // 10 min
}

export function readState(): string | null {
  return cookies().get(STATE_COOKIE)?.value ?? null;
}

export function clearState(): void {
  cookies().set(STATE_COOKIE, "", { ...baseCookieOptions(), maxAge: 0 });
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}
