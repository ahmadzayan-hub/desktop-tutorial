import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { I18nProvider, useI18n } from "./I18nContext";
import { en } from "./en";
import { ar } from "./ar";

/**
 * Structural parity check.
 *
 * The Widen<T> type in dict.ts guarantees at COMPILE time that ar.ts has the
 * same shape as en.ts. This test guarantees at RUNTIME that every leaf key
 * resolves in both dictionaries. That catches:
 *   1. A translator leaving a value undefined or empty.
 *   2. A copy-paste that swaps a string for an object (or vice versa).
 */
function walk(obj: unknown, path: string, out: string[]) {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) walk(v, path ? `${path}.${k}` : k, out);
  } else {
    out.push(path);
  }
}

describe("i18n dictionary contract", () => {
  it("every leaf path in en exists in ar", () => {
    const enPaths: string[] = [];
    walk(en, "", enPaths);
    let missing = 0;
    for (const p of enPaths) {
      const arValue = p.split(".").reduce<unknown>(
        (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
        ar,
      );
      if (arValue === undefined || arValue === null || arValue === "") missing++;
    }
    expect(missing).toBe(0);
  });

  it("every leaf path in ar has an en counterpart", () => {
    const arPaths: string[] = [];
    walk(ar, "", arPaths);
    let missing = 0;
    for (const p of arPaths) {
      const enValue = p.split(".").reduce<unknown>(
        (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
        en,
      );
      if (enValue === undefined || enValue === null || enValue === "") missing++;
    }
    expect(missing).toBe(0);
  });

  it("interpolates {var} placeholders", () => {
    let seen = "";
    function Probe() {
      const { t, setLang } = useI18n();
      // Use a real interpolated key from the dictionary.
      seen = t("customize.message.counter", { n: 42 });
      // Also exercise language switch to ensure the provider re-renders.
      act(() => setLang("en"));
      return null;
    }
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    expect(seen).toContain("42");
    // Placeholder braces should not leak through when the var was supplied.
    expect(seen).not.toContain("{n}");
  });

  it("toggleLang flips the html dir attribute", () => {
    function Probe() {
      const { lang, toggleLang } = useI18n();
      return <button data-testid="p" onClick={toggleLang}>{lang}</button>;
    }
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    // The provider's useEffect writes document.documentElement.dir on mount.
    const dirBefore = document.documentElement.dir;
    act(() => screen.getByTestId("p").click());
    expect(document.documentElement.dir).not.toBe(dirBefore);
  });
});
