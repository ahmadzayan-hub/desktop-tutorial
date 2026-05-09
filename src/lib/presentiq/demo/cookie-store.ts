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
import type { DemoProject } from "./store";

const COOKIE = "pq_demo_state";
const MAX_PROJECTS = 5;
const MAX_BYTES = 3500;

type Slim = Omit<DemoProject, "blueprint" | "slides">;

function slim(p: DemoProject): Slim {
  const { blueprint, slides, ...rest } = p;
  return rest;
}

export function readCookieProjects(): Record<string, Slim> {
  try {
    const raw = cookies().get(COOKIE)?.value;
    if (!raw) return {};
    const parsed = JSON.parse(decodeURIComponent(raw));
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch {
    return {};
  }
}

export function writeCookieProjects(projects: Record<string, DemoProject | Slim>) {
  const ids = Object.keys(projects).sort((a, b) =>
    String(projects[b]?.updated_at ?? "").localeCompare(String(projects[a]?.updated_at ?? ""))
  );
  let kept: Record<string, Slim> = {};
  for (const id of ids.slice(0, MAX_PROJECTS)) {
    kept[id] = slim(projects[id] as DemoProject);
  }
  let json = JSON.stringify(kept);
  while (json.length > MAX_BYTES && Object.keys(kept).length > 1) {
    const oldest = Object.keys(kept).pop()!;
    delete kept[oldest];
    json = JSON.stringify(kept);
  }
  try {
    cookies().set(COOKIE, encodeURIComponent(json), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });
  } catch {
    /* called outside a route-handler / server-action context — ignore */
  }
}

export function upsertCookieProject(p: DemoProject) {
  const all = readCookieProjects();
  all[p.id] = slim(p);
  writeCookieProjects(all);
}

export function getCookieProject(id: string): Slim | null {
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
