import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Receives Content Security Policy violation reports sent by browsers.
 *
 * Browsers POST to this endpoint when a resource is blocked by the CSP header.
 * The report body is JSON (application/csp-report or application/json).
 *
 * In production, connect this to your monitoring service (Sentry, Datadog, etc.)
 * instead of (or in addition to) console logging.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = body["csp-report"] ?? body;

    // Ignore browser extension noise and localhost dev noise in production
    const blockedUri = report["blocked-uri"] ?? report.blockedURI ?? "";
    if (
      blockedUri.startsWith("chrome-extension://") ||
      blockedUri.startsWith("moz-extension://") ||
      blockedUri === "inline"
    ) {
      return NextResponse.json({ ok: true });
    }

    console.warn("[CSP violation]", {
      documentUri: report["document-uri"] ?? report.documentURL,
      violatedDirective: report["violated-directive"] ?? report.effectiveDirective,
      blockedUri,
      referrer: report.referrer,
      ua: req.headers.get("user-agent"),
    });

    // TODO: forward to Sentry / Datadog / Slack webhook in production
    // await sendToMonitoring(report);
  } catch {
    // Malformed report body — log and ignore
  }

  return NextResponse.json({ ok: true });
}
