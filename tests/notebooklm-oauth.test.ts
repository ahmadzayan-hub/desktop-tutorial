import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildAuthUrl,
  notebookLmConfig,
  hasNotebookLmEnv,
  normaliseTokenResponse,
  isExpired,
  DEFAULT_NOTEBOOKLM_SCOPES,
  GOOGLE_AUTH_ENDPOINT,
  type NotebookLmConfig,
} from "../src/lib/integrations/notebooklm";
import { encrypt, decrypt } from "../src/lib/integrations/secure-store";

const config: NotebookLmConfig = {
  clientId: "client-123.apps.googleusercontent.com",
  clientSecret: "secret-xyz",
  redirectUri: "https://console.beyondstyle.ae/api/integrations/notebooklm/callback",
  scopes: ["openid", "email", "https://www.googleapis.com/auth/drive.readonly"],
};

describe("NotebookLM OAuth — authorization URL", () => {
  it("builds a Google consent URL with the required params", () => {
    const url = new URL(buildAuthUrl(config, "state-token"));
    expect(`${url.origin}${url.pathname}`).toBe(GOOGLE_AUTH_ENDPOINT);
    expect(url.searchParams.get("client_id")).toBe(config.clientId);
    expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("state-token");
    expect(url.searchParams.get("scope")).toBe(config.scopes.join(" "));
  });

  it("requests offline access + consent so a refresh_token is returned", () => {
    const url = new URL(buildAuthUrl(config, "s"));
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
  });
});

describe("NotebookLM OAuth — config from env", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    delete process.env.GOOGLE_OAUTH_CLIENT_ID;
    delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    delete process.env.GOOGLE_OAUTH_REDIRECT_URI;
    delete process.env.NOTEBOOKLM_OAUTH_SCOPES;
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it("returns null when not configured", () => {
    expect(notebookLmConfig()).toBeNull();
    expect(hasNotebookLmEnv()).toBe(false);
  });

  it("uses the fallback redirect URI when GOOGLE_OAUTH_REDIRECT_URI is unset", () => {
    process.env.GOOGLE_OAUTH_CLIENT_ID = "cid";
    process.env.GOOGLE_OAUTH_CLIENT_SECRET = "csecret";
    const c = notebookLmConfig("https://x.test/callback");
    expect(c?.redirectUri).toBe("https://x.test/callback");
    expect(c?.scopes).toEqual(DEFAULT_NOTEBOOKLM_SCOPES);
  });

  it("parses space-separated custom scopes", () => {
    process.env.GOOGLE_OAUTH_CLIENT_ID = "cid";
    process.env.GOOGLE_OAUTH_CLIENT_SECRET = "csecret";
    process.env.GOOGLE_OAUTH_REDIRECT_URI = "https://x.test/cb";
    process.env.NOTEBOOKLM_OAUTH_SCOPES = "openid  profile   drive.readonly";
    expect(notebookLmConfig()?.scopes).toEqual(["openid", "profile", "drive.readonly"]);
  });
});

describe("NotebookLM OAuth — token normalisation", () => {
  it("derives absolute expiry from expires_in", () => {
    const now = 1_000_000;
    const t = normaliseTokenResponse(
      { access_token: "a", refresh_token: "r", expires_in: 3600, scope: "openid email" },
      now
    );
    expect(t.access_token).toBe("a");
    expect(t.refresh_token).toBe("r");
    expect(t.expires_at).toBe(now + 3600 * 1000);
  });

  it("throws when access_token is missing", () => {
    expect(() => normaliseTokenResponse({ expires_in: 10 })).toThrow(/access_token/);
  });

  it("isExpired respects the skew window", () => {
    const now = 1_000_000;
    const t = normaliseTokenResponse({ access_token: "a", expires_in: 100 }, now);
    expect(isExpired(t, 60_000, now)).toBe(false);
    expect(isExpired(t, 60_000, now + 50_000)).toBe(true); // within 60s skew of expiry
  });
});

describe("token store — AES-256-GCM round trip", () => {
  it("encrypts then decrypts back to the original", () => {
    const key = Buffer.alloc(32, 7);
    const payload = JSON.stringify({ access_token: "secret", refresh_token: "r" });
    const enc = encrypt(payload, key);
    expect(enc).not.toContain("secret");
    expect(decrypt(enc, key)).toBe(payload);
  });

  it("returns null on a tampered payload", () => {
    const key = Buffer.alloc(32, 7);
    const enc = encrypt("hello", key);
    const tampered = enc.slice(0, -2) + "xy";
    expect(decrypt(tampered, key)).toBeNull();
  });

  it("returns null when decrypted with the wrong key", () => {
    const enc = encrypt("hello", Buffer.alloc(32, 1));
    expect(decrypt(enc, Buffer.alloc(32, 2))).toBeNull();
  });
});
