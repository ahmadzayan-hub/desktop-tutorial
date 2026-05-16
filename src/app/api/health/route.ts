import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mutabasir",
    phase: 1,
    timestamp: new Date().toISOString(),
  });
}
