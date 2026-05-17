import "server-only";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import type { DbProject, Subject } from "@/types/database";
import type { ThemeId } from "@/lib/themes/types";

// Supabase-backed project CRUD. Mirrors the mock-store API so callers can
// be switched without ceremony. RLS enforces owner-only access at the
// database layer; we rely on the authenticated session for filtering.

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

interface ProjectRow {
  id: string;
  owner_id: string;
  name: string;
  subject: string;
  theme: string;
  client_authority_en: string | null;
  client_authority_ar: string | null;
  counterparty_en: string | null;
  counterparty_ar: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function toDbProject(row: ProjectRow): DbProject {
  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    subject: row.subject as Subject,
    theme: row.theme as ThemeId,
    client_authority_en: row.client_authority_en,
    client_authority_ar: row.client_authority_ar,
    counterparty_en: row.counterparty_en,
    counterparty_ar: row.counterparty_ar,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status as DbProject["status"],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function sbListProjects(): Promise<DbProject[]> {
  const user = await getServerUser();
  if (!user) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase-store] list failed", error.message);
    return [];
  }
  return (data ?? []).map(toDbProject);
}

export async function sbGetProject(id: string): Promise<DbProject | null> {
  if (!id) return null;
  const user = await getServerUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return toDbProject(data);
}

export async function sbCreateProject(
  input: CreateProjectInput,
): Promise<DbProject | null> {
  const user = await getServerUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: input.name,
      subject: input.subject,
      theme: input.theme,
      client_authority_en: input.client_authority_en,
      client_authority_ar: input.client_authority_ar,
      counterparty_en: input.counterparty_en,
      counterparty_ar: input.counterparty_ar,
      start_date: input.start_date,
      end_date: input.end_date,
    })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[supabase-store] create failed", error?.message);
    return null;
  }
  return toDbProject(data);
}

export async function sbDeleteProject(id: string): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) {
    console.error("[supabase-store] delete failed", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}
