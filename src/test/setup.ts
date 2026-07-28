// Vitest global setup. Loaded once per test process.
// Registers jest-dom matchers, mocks browser APIs that jsdom doesn't ship, and
// clears any DOM/state between tests so specs don't leak into each other.

import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not implement matchMedia; the PWA install prompt and layout
// components probe it. A permissive stub is safer than letting each spec
// mock it individually.
beforeAll(() => {
  if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
  // jsdom lacks IntersectionObserver; the Reveal component uses it.
  if (typeof window !== "undefined" && !(window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    }
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
  }
});

afterEach(() => {
  cleanup();
});
