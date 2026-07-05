import { describe, expect, it } from "vitest";
import { isValidProject, newProject, sortProjects } from "./projects";

describe("mock-store · pure logic", () => {
  it("newProject builds a draft project with timestamps", () => {
    const p = newProject({
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
    expect(p.created_at).toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(p.owner_id).toBeTruthy();
  });

  it("newProject preserves nullable fields", () => {
    const p = newProject({
      name: "Minimal",
      subject: "tender_evaluation",
      theme: "petrol",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });
    expect(p.client_authority_en).toBeNull();
    expect(p.start_date).toBeNull();
  });

  it("sortProjects orders by created_at descending", () => {
    const older = newProject({
      name: "Older",
      subject: "contract_management",
      theme: "civic",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });
    // Force newer timestamp
    const newer = {
      ...newProject({
        name: "Newer",
        subject: "tender_evaluation",
        theme: "utility",
        client_authority_en: null,
        client_authority_ar: null,
        counterparty_en: null,
        counterparty_ar: null,
        start_date: null,
        end_date: null,
      }),
      created_at: new Date(Date.now() + 1000).toISOString(),
    };

    const sorted = sortProjects([older, newer]);
    expect(sorted[0]?.name).toBe("Newer");
    expect(sorted[1]?.name).toBe("Older");
  });

  it("sortProjects does not mutate input", () => {
    const a = newProject({
      name: "A",
      subject: "contract_management",
      theme: "civic",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });
    const input = [a];
    sortProjects(input);
    expect(input).toHaveLength(1);
    expect(input[0]).toBe(a);
  });

  it("isValidProject accepts well-formed values and rejects others", () => {
    const p = newProject({
      name: "Real",
      subject: "contract_management",
      theme: "civic",
      client_authority_en: null,
      client_authority_ar: null,
      counterparty_en: null,
      counterparty_ar: null,
      start_date: null,
      end_date: null,
    });
    expect(isValidProject(p)).toBe(true);
    expect(isValidProject(null)).toBe(false);
    expect(isValidProject(undefined)).toBe(false);
    expect(isValidProject({})).toBe(false);
    expect(isValidProject({ id: "x" })).toBe(false);
    expect(isValidProject("string")).toBe(false);
  });
});
