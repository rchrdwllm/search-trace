import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";

export function clearPublicSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}

export function renderWithCleanEnvironment(
  ui: ReactNode,
  options?: RenderOptions,
) {
  clearPublicSupabaseEnv();
  return render(ui, options);
}
