import { createBrowserClient } from "@supabase/ssr";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({ mocked: true })),
}));

describe("browser Supabase factory", () => {
  it("does not construct or fetch on import", () => {
    expect(createBrowserClient).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("validates lazily and passes the public values once", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    createBrowserSupabaseClient();
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
    expect(createBrowserClient).toHaveBeenCalledWith("https://project.supabase.co", "publishable-key");
  });
});
