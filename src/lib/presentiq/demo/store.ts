/**
 * In-memory demo store for PresentIQ.
 *
 * Used when Supabase is not available (no env vars, or no logged-in user).
 * Lets the wizard, dashboard, brand-kit, project, and slide flows work end-to-end
 * for trial users with no setup.
 *
 * Module-level state is shared across all requests on the same Vercel instance.
 * That's enough for a demo trial; persistence is not guaranteed across deploys.
 */

import { randomUUID } from "node:crypto";
import type { Slide, Blueprint, ProjectStatus } from "../types";

export type DemoProject = {
  id: string;
  organization_id: string;
  owner_id: string;
  brand_kit_id: string | null;
  title: string;
  audience: string | null;
  objective: string | null;
  decision_required: string | null;
  language_mode: "en" | "ar" | "bilingual";
  presentation_mode: string;
  target_slide_count: number;
  target_duration_min: number;
  confidentiality_level: "public" | "internal" | "confidential" | "strictly_confidential";
  status: ProjectStatus;
  blueprint?: Blueprint;
  slides?: Slide[];
  created_at: string;
  updated_at: string;
};

export type DemoBrandKit = {
  id: string;
  organization_id: string;
  name: string;
  is_default: boolean;
  preset?: "corporate" | "government" | "consulting" | "uae_pine";
  colors: Record<string, string>;
  fonts: Record<string, string>;
  logos: { url: string; kind: "primary" | "mono" | "ar" }[];
  created_at: string;
};

export type DemoFeedback = {
  id: string;
  email: string;
  subject: string;
  message: string;
  source: string;
  created_at: string;
};

const projects = new Map<string, DemoProject>();
const brandKits = new Map<string, DemoBrandKit>();
const feedback: DemoFeedback[] = [];

// Seed a default brand kit and a demo project so the dashboard isn't empty.
const DEMO_ORG = "demo-org-pq";
const DEMO_USER = "demo-user-pq";

(function seed() {
  if (brandKits.size > 0) return;
  const kitId = randomUUID();
  brandKits.set(kitId, {
    id: kitId,
    organization_id: DEMO_ORG,
    name: "Pine — UAE Corporate (default)",
    is_default: true,
    preset: "uae_pine",
    colors: {
      primary: "#013230",
      secondary: "#0B6E69",
      accent_1: "#50C8C2",
      accent_2: "#D1F2F0",
      surface: "#F4FBFA",
      foreground: "#013230",
    },
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
    logos: [],
    created_at: new Date().toISOString(),
  });
  // Seed a sample project for tour purposes.
  const projectId = randomUUID();
  projects.set(projectId, {
    id: projectId,
    organization_id: DEMO_ORG,
    owner_id: DEMO_USER,
    brand_kit_id: kitId,
    title: "Q3 Steering Committee — Boardroom Brief",
    audience: "Executive Director",
    objective: "Approve the quarterly portfolio recovery plan.",
    decision_required: "Approval to proceed with Option B",
    language_mode: "bilingual",
    presentation_mode: "corporate_boardroom",
    target_slide_count: 14,
    target_duration_min: 25,
    confidentiality_level: "confidential",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
})();

// ─── Projects ──────────────────────────────────────────────────────

export function listProjects(orgId: string) {
  return Array.from(projects.values())
    .filter((p) => p.organization_id === orgId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getProject(id: string) {
  return projects.get(id) ?? null;
}

export function createProject(input: Omit<DemoProject, "id" | "created_at" | "updated_at" | "status">) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const row: DemoProject = { ...input, id, status: "draft", created_at: now, updated_at: now };
  projects.set(id, row);
  return row;
}

export function updateProject(id: string, patch: Partial<DemoProject>) {
  const row = projects.get(id);
  if (!row) return null;
  const next = { ...row, ...patch, updated_at: new Date().toISOString() };
  projects.set(id, next);
  return next;
}

export function deleteProject(id: string) {
  return projects.delete(id);
}

// ─── Brand kits ────────────────────────────────────────────────────

export function listBrandKits(orgId: string) {
  return Array.from(brandKits.values())
    .filter((k) => k.organization_id === orgId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getBrandKit(id: string) {
  return brandKits.get(id) ?? null;
}

export function createBrandKit(input: Omit<DemoBrandKit, "id" | "created_at">) {
  const id = randomUUID();
  const row: DemoBrandKit = { ...input, id, created_at: new Date().toISOString() };
  if (input.is_default) {
    for (const [kid, k] of brandKits) {
      if (k.organization_id === input.organization_id && k.is_default) {
        brandKits.set(kid, { ...k, is_default: false });
      }
    }
  }
  brandKits.set(id, row);
  return row;
}

// ─── Feedback ──────────────────────────────────────────────────────

export function recordFeedback(input: Omit<DemoFeedback, "id" | "created_at">) {
  const row: DemoFeedback = { ...input, id: randomUUID(), created_at: new Date().toISOString() };
  feedback.push(row);
  return row;
}

export function listFeedback() {
  return feedback.slice();
}

// ─── Constants ─────────────────────────────────────────────────────

export const DEMO_ORG_ID = DEMO_ORG;
export const DEMO_USER_ID = DEMO_USER;
