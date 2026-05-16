import type { DbProject } from "@/types/database";

// Phase 1 only. Replaced by Supabase queries in Phase 2.
// Process-memory only: data is lost on dev server restart.

const projects = new Map<string, DbProject>();

const DEMO_OWNER = "demo-owner-00000000";

export const mockSession = {
  user: {
    id: DEMO_OWNER,
    email: "demo@mutabasir.ae",
    full_name: "Demo User",
  },
};

function id(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

export function listProjects(): DbProject[] {
  return Array.from(projects.values())
    .filter((p) => p.owner_id === DEMO_OWNER)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getProject(projectId: string): DbProject | null {
  const p = projects.get(projectId);
  if (!p || p.owner_id !== DEMO_OWNER) return null;
  return p;
}

export function createProject(input: {
  name: string;
  subject: DbProject["subject"];
  theme: DbProject["theme"];
  client_authority_en: string | null;
  client_authority_ar: string | null;
  counterparty_en: string | null;
  counterparty_ar: string | null;
  start_date: string | null;
  end_date: string | null;
}): DbProject {
  const now = nowIso();
  const project: DbProject = {
    id: id(),
    owner_id: DEMO_OWNER,
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
  projects.set(project.id, project);
  return project;
}

export function deleteProject(projectId: string): void {
  const p = projects.get(projectId);
  if (!p || p.owner_id !== DEMO_OWNER) return;
  projects.delete(projectId);
}
