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
      name: "Strategic Contract Q2",
      subject: "contract_management",
      theme: "civic",
      client_authority_en: "Government Authority",
      client_authority_ar: "جهة حكومية",
      counterparty_en: "Consulting Co.",
      counterparty_ar: "شركة استشارات",
      start_date: "2026-01-01",
      end_date: "2026-12-31",
    });

    expect(p.id).toBeTruthy();
    expect(p.name).toBe("Strategic Contract Q2");
    expect(p.subject).toBe("contract_management");
    expect(p.theme).toBe("civic");
    expect(p.status).toBe("draft");
  });

  it("retrieves a project by id", () => {
    const p = createProject({
      name: "Tender 2026/A",
      subject: "tender_evaluation",
      theme: "petrol",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });

    expect(getProject(p.id)?.name).toBe("Tender 2026/A");
  });

  it("returns null for unknown ids", () => {
    expect(getProject("does-not-exist")).toBeNull();
  });

  it("lists projects newest-first", async () => {
    const a = createProject({
      name: "First",
      subject: "contract_management",
      theme: "civic",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const b = createProject({
      name: "Second",
      subject: "tender_evaluation",
      theme: "utility",
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
      theme: "civic",
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
