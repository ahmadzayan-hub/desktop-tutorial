/**
 * Standard API response helpers.
 */

import { NextResponse } from "next/server";

export const json = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (code: string, message: string, status = 400, details?: unknown) =>
  NextResponse.json({ error: { code, message, details } }, { status });

export const unauthorized = () => fail("unauthorized", "Authentication required", 401);
export const forbidden = () => fail("forbidden", "Insufficient permissions", 403);
export const notFound = (what = "resource") => fail("not_found", `${what} not found`, 404);
