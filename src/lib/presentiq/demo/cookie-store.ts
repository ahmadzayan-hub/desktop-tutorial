/**
 * Cookie-backed persistence layer for the demo store.
 *
 * Vercel deploys each route as its own serverless function, so the
 * module-level Map in `store.ts` is not shared across the wizard's
 * sequence of calls (POST /projects → POST /blueprint → POST /slides
 * → POST /export-pptx). To keep the demo flow stateful without a
 * database we round-trip the brief via an HTTP cookie.
 *
 * Only the BRIEF (project metadata, audience, etc.) is persisted in
 * the cookie. Blueprint and slides are deterministic functions of the
 * brief and are regenerated on demand each request, which keeps the
 * cookie comfortably under the ~4KB per-cookie browser limit.
 */

import { cookies } from "next/headers";
import type { DemoBrandKit, DemoProject } from "./store";

const COOKIE_PROJECTS = "pq_demo_state";
const COOKIE_KITS     = "pq_demo_kits";
const MAX_PROJECTS    = 5;
const MAX_KITS        = 5;
const MAX_BYTES       = 3500;

type SlimProject = Omit<DemoProject, "blueprint" | "slides">;

function slimProject(p: DemoProject): SlimProject {
  const { blueprint, slides, ...rest } = p;
  return rest;
}

function readCookie<T = any>(name: string): Record<string, T> {
  try {
    const raw = cookies().get(name)?.value;
    if (!raw) return {};
    const parsed = JSON.parse(decodeURIComponent(raw));
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch {
    return {};
  }
}

function writeCookie(name: string, value: Record<string, unknown>) {
  try {
    const json = JSON.stringify(value);
    cookies().set(name, encodeURIComponent(json), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });
  } catch {
    /* called outside a route-handler / server-action context — ignore */
  }
}

// ─── Projects ─────────────────────────────────────────────────────────

export function readCookieProjects(): Record<string, SlimProject> {
  return readCookie<SlimProject>(COOKIE_PROJECTS);
}

export function writeCookieProjects(projects: Record<string, DemoProject | SlimProject>) {
  const ids = Object.keys(projects).sort((a, b) =>
    String(projects[b]?.updated_at ?? "").localeCompare(String(projects[a]?.updated_at ?? ""))
  );
  let kept: Record<string, SlimProject> = {};
  for (const id of ids.slice(0, MAX_PROJECTS)) {
    kept[id] = slimProject(projects[id] as DemoProject);
  }
  let json = JSON.stringify(kept);
  while (json.length > MAX_BYTES && Object.keys(kept).length > 1) {
    const oldest = Object.keys(kept).pop()!;
    delete kept[oldest];
    json = JSON.stringify(kept);
  }
  writeCookie(COOKIE_PROJECTS, kept);
}

export function upsertCookieProject(p: DemoProject) {
  const all = readCookieProjects();
  all[p.id] = slimProject(p);
  writeCookieProjects(all);
}

export function getCookieProject(id: string): SlimProject | null {
  const all = readCookieProjects();
  return all[id] ?? null;
}

export function deleteCookieProject(id: string) {
  const all = readCookieProjects();
  if (!(id in all)) return false;
  delete all[id];
  writeCookieProjects(all);
  return true;
}

// ─── Brand kits ───────────────────────────────────────────────────────

export function readCookieBrandKits(): Record<string, DemoBrandKit> {
  return readCookie<DemoBrandKit>(COOKIE_KITS);
}

export function writeCookieBrandKits(kits: Record<string, DemoBrandKit>) {
  const ids = Object.keys(kits).sort((a, b) =>
    String(kits[b]?.created_at ?? "").localeCompare(String(kits[a]?.created_at ?? ""))
  );
  let kept: Record<string, DemoBrandKit> = {};
  for (const id of ids.slice(0, MAX_KITS)) {
    kept[id] = kits[id];
  }
  let json = JSON.stringify(kept);
  while (json.length > MAX_BYTES && Object.keys(kept).length > 1) {
    const oldest = Object.keys(kept).pop()!;
    delete kept[oldest];
    json = JSON.stringify(kept);
  }
  writeCookie(COOKIE_KITS, kept);
}

export function upsertCookieBrandKit(k: DemoBrandKit) {
  const all = readCookieBrandKits();
  all[k.id] = k;
  writeCookieBrandKits(all);
}

export function getCookieBrandKit(id: string): DemoBrandKit | null {
  const all = readCookieBrandKits();
  return all[id] ?? null;
}
