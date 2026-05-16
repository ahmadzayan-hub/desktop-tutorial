import { afterEach, describe, expect, it } from "vitest";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
} from "./mock-store";

function cleanup() {
  for (const p of listProjects()) {
    deleteProject(p.id);
  }
}

describe("mock-store", () => {
  afterEach(() => cleanup());

  it("starts empty", () => {
    cleanup();
    expect(listProjects()).toHaveLength(0);
  });

  it("creates a project with the provided fields", () => {
    const p = createProject({
      name: "SENER Contract",
      subject: "contract_management",
      theme: "rta",
      client_authority_en: "RTA",
      client_authority_ar: "هيئة الطرق والمواصلات",
      counterparty_en: "SENER",
      counterparty_ar: "سينر",
      start_date: "2026-01-01",
      end_date: "2026-12-31",
    });

    expect(p.id).toBeTruthy();
    expect(p.name).toBe("SENER Contract");
    expect(p.subject).toBe("contract_management");
    expect(p.theme).toBe("rta");
    expect(p.status).toBe("draft");
  });

  it("retrieves a project by id", () => {
    const p = createProject({
      name: "Test",
      subject: "tender_evaluation",
      theme: "adnoc",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });

    expect(getProject(p.id)?.name).toBe("Test");
  });

  it("returns null for unknown ids", () => {
    expect(getProject("does-not-exist")).toBeNull();
  });

  it("lists projects newest-first", async () => {
    const a = createProject({
      name: "First",
      subject: "contract_management",
      theme: "rta",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });
    // Ensure a strictly later timestamp for the second project.
    await new Promise((resolve) => setTimeout(resolve, 5));
    const b = createProject({
      name: "Second",
      subject: "tender_evaluation",
      theme: "dewa",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });

    const list = listProjects();
    expect(list[0]?.id).toBe(b.id);
    expect(list[1]?.id).toBe(a.id);
  });

  it("deletes a project", () => {
    const p = createProject({
      name: "Temp",
      subject: "contract_management",
      theme: "rta",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });

    deleteProject(p.id);
    expect(getProject(p.id)).toBeNull();
  });
});
