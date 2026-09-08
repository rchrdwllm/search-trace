import {
  SupabaseConfigurationError,
  getPublicSupabaseConfig,
  validatePublicSupabaseConfig,
} from "@/lib/supabase/config";

describe("public Supabase configuration", () => {
  it.each([
    ["https://project.supabase.co", "publishable-key"],
    ["http://localhost:54321", "local-key"],
    ["http://127.0.0.1:54321", "local-key"],
  ])("normalizes supported values", (url, publishableKey) => {
    expect(validatePublicSupabaseConfig({ url: ` ${url} `, publishableKey: ` ${publishableKey} ` })).toEqual({ url, publishableKey });
  });

  it("aggregates missing values and never echoes them", () => {
    const error = () => validatePublicSupabaseConfig({});
    expect(error).toThrow(SupabaseConfigurationError);
    expect(error).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(error).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    expect(error).toThrow(/\.env\.example/);
  });

  it.each([
    { url: " ", publishableKey: "key" },
    { url: "not-a-url", publishableKey: "key" },
    { url: "http://project.supabase.co", publishableKey: "key" },
  ])("rejects malformed or unsafe URLs", (candidate) => {
    const error = () => validatePublicSupabaseConfig(candidate);
    expect(error).toThrow(SupabaseConfigurationError);
    expect(error).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(error).toThrow(/\.env\.example/);
  });

  it("does not echo a supplied key or URL in failures", () => {
    const url = "ftp://private.example.invalid/project";
    const key = "candidate-value-should-not-echo";
    try {
      validatePublicSupabaseConfig({ url, publishableKey: key });
    } catch (error) {
      expect(String(error)).not.toContain(url);
      expect(String(error)).not.toContain(key);
    }
  });

  it("reads direct literal environment variables only when requested", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "key";
    expect(getPublicSupabaseConfig()).toEqual({ url: "https://project.supabase.co", publishableKey: "key" });
  });
});
