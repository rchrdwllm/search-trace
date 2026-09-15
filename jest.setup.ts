import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { clearPublicSupabaseEnv } from "@/tests/001-project-foundation/test-utils";
import { TextEncoder, TextDecoder } from "node:util";

Object.assign(globalThis, { TextEncoder, TextDecoder });

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverMock {
    constructor(callback: ResizeObserverCallback) {
      void callback;
    }
    observe(target: Element, options?: ResizeObserverOptions) {
      void target;
      void options;
    }
    unobserve(target: Element) {
      void target;
    }
    disconnect() {}
  }

  Object.assign(globalThis, { ResizeObserver: ResizeObserverMock });
}

expect.extend(toHaveNoViolations);

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: jest.fn(),
      addListener: jest.fn(),
      dispatchEvent: jest.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    }),
  });
}

beforeEach(() => {
  clearPublicSupabaseEnv();
  if (typeof global.fetch === "function" && !jest.isMockFunction(global.fetch)) {
    jest.spyOn(global, "fetch").mockResolvedValue(new Response());
  } else if (typeof global.fetch !== "function") {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });
  }
});

afterEach(() => {
  clearPublicSupabaseEnv();
  cleanup();
  jest.restoreAllMocks();
  if (typeof document !== "undefined") document.body.innerHTML = "";
});
