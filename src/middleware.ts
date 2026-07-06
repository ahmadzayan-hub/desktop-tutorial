import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "../utils/supabase/middleware";

/**
 * Runs on every request:
 * 1. Keeps the Supabase session fresh (cookie refresh).
 * 2. Blocks unauthenticated access to /api/admin/* at the edge — a defence-in-depth
 *    layer on top of the per-route auth checks in each admin route handler.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Edge-level admin route guard — must have a session cookie to even reach the route.
  // The route handler still re-validates role=admin via the DB; this is an early exit.
  if (pathname.startsWith("/api/admin")) {
    const hasCookie =
      request.cookies.has("sb-access-token") ||
      // Supabase SSR sets a chunked cookie with a numeric suffix pattern
      [...request.cookies.getAll()].some(c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

    if (!hasCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on all paths EXCEPT static assets, the SW, and known public files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js|demo.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
