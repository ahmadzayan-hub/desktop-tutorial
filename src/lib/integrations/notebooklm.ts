// NotebookLM (Google) OAuth 2.0 integration · pure config + flow helpers.
//
// NotebookLM is a Google product and authenticates through Google's standard
// OAuth 2.0 authorization-code flow. This module is deliberately free of any
// Next.js / cookie / I/O concerns so the URL building and token exchange can be
// unit-tested and reused. Keys come only from env (no secrets in code), and
// every helper degrades gracefully when the integration is not configured.

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GOOGLE_REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

// Default scopes requested when connecting NotebookLM. NotebookLM does not (yet)
// expose a dedicated public API scope, so we request the user's basic profile +
// Drive read-only (NotebookLM sources live in Google Drive). Override with the
// NOTEBOOKLM_OAUTH_SCOPES env var (space-separated) when Google grants the app
// a more specific scope.
export const DEFAULT_NOTEBOOKLM_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.readonly",
];

export interface NotebookLmConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  /** Absolute expiry as epoch milliseconds (derived from `expires_in`). */
  expires_at: number;
  scope?: string;
  token_type?: string;
  /** OpenID Connect id_token, when `openid` scope is granted. */
  id_token?: string;
}

/**
 * Read NotebookLM OAuth config from the environment. Returns `null` when the
 * minimum required vars are missing so callers can show a "not configured"
 * state instead of crashing.
 *
 * @param fallbackRedirectUri used when GOOGLE_OAUTH_REDIRECT_URI is unset
 *   (e.g. derived from the incoming request origin).
 */
export function notebookLmConfig(fallbackRedirectUri?: string): NotebookLmConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || fallbackRedirectUri;

  if (!clientId || !clientSecret || !redirectUri) return null;

  const rawScopes = process.env.NOTEBOOKLM_OAUTH_SCOPES?.trim();
  const scopes = rawScopes ? rawScopes.split(/\s+/).filter(Boolean) : DEFAULT_NOTEBOOKLM_SCOPES;

  return { clientId, clientSecret, redirectUri, scopes };
}

/** True when the integration has the env it needs to run the OAuth flow. */
export function hasNotebookLmEnv(): boolean {
  return notebookLmConfig("https://placeholder.local/callback") !== null;
}

/**
 * Build the Google consent-screen URL. `state` is an opaque anti-CSRF token the
 * caller must also store (e.g. in a signed cookie) and re-check on callback.
 */
export function buildAuthUrl(config: NotebookLmConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    // `offline` + `consent` ensure a refresh_token is returned even on re-auth.
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/** Convert a Google token response into our normalised `OAuthTokens` shape. */
export function normaliseTokenResponse(
  raw: Record<string, unknown>,
  now: number = Date.now()
): OAuthTokens {
  const accessToken = typeof raw.access_token === "string" ? raw.access_token : "";
  if (!accessToken) {
    throw new Error("Token response missing access_token");
  }
  const expiresIn = typeof raw.expires_in === "number" ? raw.expires_in : 3600;
  return {
    access_token: accessToken,
    refresh_token: typeof raw.refresh_token === "string" ? raw.refresh_token : undefined,
    expires_at: now + expiresIn * 1000,
    scope: typeof raw.scope === "string" ? raw.scope : undefined,
    token_type: typeof raw.token_type === "string" ? raw.token_type : undefined,
    id_token: typeof raw.id_token === "string" ? raw.id_token : undefined,
  };
}

/** Exchange an authorization `code` for tokens (server-side; uses the secret). */
export async function exchangeCodeForTokens(
  config: NotebookLmConfig,
  code: string
): Promise<OAuthTokens> {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${await safeBody(res)}`);
  }
  return normaliseTokenResponse(await res.json());
}

/**
 * Refresh an access token. Google does not re-issue the refresh_token, so we
 * carry the existing one forward into the returned tokens.
 */
export async function refreshAccessToken(
  config: NotebookLmConfig,
  refreshToken: string
): Promise<OAuthTokens> {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status}): ${await safeBody(res)}`);
  }
  const tokens = normaliseTokenResponse(await res.json());
  return { ...tokens, refresh_token: tokens.refresh_token ?? refreshToken };
}

/** Best-effort revoke of a token at Google's endpoint (used on disconnect). */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(GOOGLE_REVOKE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
  } catch {
    // Revocation is best-effort; clearing local tokens is what matters.
  }
}

/** True when the access token is expired (or within `skewMs` of expiring). */
export function isExpired(tokens: OAuthTokens, skewMs = 60_000, now = Date.now()): boolean {
  return tokens.expires_at - skewMs <= now;
}

async function safeBody(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "<no body>";
  }
}
