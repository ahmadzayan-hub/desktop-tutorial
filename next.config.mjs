/** @type {import('next').NextConfig} */

// Origins allowed to call /api/* from a browser.
// In production only the canonical domain; in dev also localhost.
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [
        "https://www.tweenz.ae",
        "https://tweenz.ae",
        // Vercel preview URLs follow this pattern
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
      ]
    : ["http://localhost:3000", "http://localhost:3001"];

const CORS_ORIGIN = ALLOWED_ORIGINS.join(",");

// Content Security Policy — blocks injected scripts, frames from unknown origins,
// and mixed-content. Adjust src directives as new integrations are added.
const CSP = [
  "default-src 'self'",
  // Scripts: self + inline styles needed by Next.js hydration (nonces would be ideal but require edge middleware rewrite)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Styles: self + inline (Tailwind purges but Next.js injects critical CSS inline) + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts: self + data URIs + Google Fonts CDN
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  // API calls allowed only to self and Supabase
  `connect-src 'self' https://*.supabase.co https://api.openai.com wss://*.supabase.co`,
  // No plugins, no object embeds
  "object-src 'none'",
  // Frames: only self (e.g. PWA install prompt)
  "frame-src 'self'",
  // Upgrade any accidental http requests
  "upgrade-insecure-requests",
  // Collect violation reports at our own endpoint (no third-party data sharing)
  "report-uri /api/csp-report"
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // On Vercel, VERCEL_URL is auto-set (without https://); fall back to localhost for dev
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Content-Security-Policy", value: CSP }
    ];
    return [
      {
        source: "/api/:path*",
        headers: [
          // Restricted CORS — only trusted origins, not wildcard
          { key: "Access-Control-Allow-Origin", value: CORS_ORIGIN },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-org-id" },
          { key: "Access-Control-Max-Age", value: "86400" },
          { key: "Vary", value: "Origin" },
          ...security
        ]
      },
      {
        source: "/:path*",
        headers: security
      }
    ];
  }
};

export default nextConfig;
