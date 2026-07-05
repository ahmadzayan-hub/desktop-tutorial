import "server-only";
import { cookies } from "next/headers";
import type { DbProject, Subject } from "@/types/database";
import type { ThemeId } from "@/lib/themes/types";
import { mockSession } from "./session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { newId } from "@/lib/utils/ids";
import {
  sbCreateProject,
  sbDeleteProject,
  sbGetProject,
  sbListProjects,
} from "./supabase-store";

export { mockSession };

// All project CRUD here delegates to Supabase when env vars are set. The
// cookie-backed fallback survives so the app remains usable in demo mode.

function isUsingSupabase(): boolean {
  return isSupabaseConfigured();
}

const COOKIE_NAME = "mutabasir.demo.projects";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const MAX_PROJECTS = 25;

export interface CreateProjectInput {
  name: string;
  subject: Subject;
  theme: ThemeId;
  client_authority_en: string | null;
  client_authority_ar: string | null;
  counterparty_en: string | null;
  counterparty_ar: string | null;
  start_date: string | null;
  end_date: string | null;
}

// --- Pure functions (no I/O) — safe for unit tests --------------------------

function nowIso(): string {
  return new Date().toISOString();
}

export function newProject(input: CreateProjectInput): DbProject {
  const now = nowIso();
  return {
    id: newId("proj"),
    owner_id: mockSession.user.id,
    name: input.name,
    subject: input.subject,
    theme: input.theme,
    client_authority_en: input.client_authority_en,
    client_authority_ar: input.client_authority_ar,
    counterparty_en: input.counterparty_en,
    counterparty_ar: input.counterparty_ar,
    start_date: input.start_date,
    end_date: input.end_date,
    status: "draft",
    created_at: now,
    updated_at: now,
  };
}

export function sortProjects(list: DbProject[]): DbProject[] {
  return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function isValidProject(value: unknown): value is DbProject {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.subject === "string" &&
    typeof p.theme === "string" &&
    typeof p.status === "string" &&
    typeof p.created_at === "string"
  );
}

// --- Cookie I/O -------------------------------------------------------------

async function readRaw(): Promise<DbProject[]> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidProject);
  } catch {
    return [];
  }
}

async function writeRaw(list: DbProject[]): Promise<void> {
  const trimmed = list.slice(0, MAX_PROJECTS);
  const encoded = encodeURIComponent(JSON.stringify(trimmed));
  const store = await cookies();
  store.set(COOKIE_NAME, encoded, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

// --- Public API -------------------------------------------------------------

export async function listProjects(): Promise<DbProject[]> {
  if (isUsingSupabase()) return sbListProjects();
  return sortProjects(await readRaw());
}

export async function getProject(id: string): Promise<DbProject | null> {
  if (!id) return null;
  if (isUsingSupabase()) return sbGetProject(id);
  const list = await readRaw();
  return list.find((p) => p.id === id) ?? null;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<DbProject> {
  if (isUsingSupabase()) {
    const created = await sbCreateProject(input);
    if (!created) {
      throw new Error("Could not create project (not signed in or DB error).");
    }
    return created;
  }
  const current = await readRaw();
  const project = newProject(input);
  await writeRaw([project, ...current]);
  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<DbProject, "id" | "owner_id" | "created_at">>,
): Promise<DbProject | null> {
  const list = await readRaw();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const existing = list[idx]!;
  const updated: DbProject = {
    ...existing,
    ...patch,
    id: existing.id,
    owner_id: existing.owner_id,
    created_at: existing.created_at,
    updated_at: nowIso(),
  };
  const next = [...list];
  next[idx] = updated;
  await writeRaw(next);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isUsingSupabase()) return sbDeleteProject(id);
  const list = await readRaw();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  await writeRaw(next);
  return true;
}

const DEMO_SAMPLES: CreateProjectInput[] = [
  {
    name: "Project Alpha · Strategic Contract",
    subject: "contract_management",
    theme: "civic",
    client_authority_en: "Government Authority",
    client_authority_ar: "جهة حكومية",
    counterparty_en: "Consulting Co.",
    counterparty_ar: "شركة استشارات",
    start_date: "2026-01-15",
    end_date: "2026-12-31",
  },
  {
    name: "Tender 2026/A · Engineering Services",
    subject: "tender_evaluation",
    theme: "petrol",
    client_authority_en: "Energy Authority",
    client_authority_ar: "هيئة طاقة",
    counterparty_en: "Three bidders",
    counterparty_ar: "ثلاث جهات متقدّمة",
    start_date: "2026-03-01",
    end_date: "2026-05-30",
  },
];

export async function seedDemoProjects(): Promise<DbProject[]> {
  if (isUsingSupabase()) {
    const existing = await sbListProjects();
    if (existing.length > 0) return existing;
    const created: DbProject[] = [];
    for (const sample of DEMO_SAMPLES) {
      const p = await sbCreateProject(sample);
      if (p) created.push(p);
    }
    return sortProjects(created);
  }
  const current = await readRaw();
  if (current.length > 0) return current;
  const seeded = DEMO_SAMPLES.map(newProject);
  await writeRaw(seeded);
  return sortProjects(seeded);
}

export async function clearAllProjects(): Promise<void> {
  await writeRaw([]);
}
