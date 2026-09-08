/** @jest-environment node */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

jest.mock("server-only", () => ({}));
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({ mocked: true })),
}));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));

describe("server Supabase factory", () => {
  it("awaits cookies and delegates getAll/setAll adapters", async () => {
    const cookieStore = {
      getAll: jest.fn(() => [{ name: "session", value: "value" }]),
      set: jest.fn(),
    };
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";

    await createServerSupabaseClient();
    expect(cookies).toHaveBeenCalledTimes(1);
    expect(createServerClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "publishable-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
    const options = jest.mocked(createServerClient).mock.calls[0]?.[2];
    expect(options?.cookies.getAll()).toEqual([{ name: "session", value: "value" }]);
    options?.cookies.setAll?.([{ name: "session", value: "next", options: { path: "/" } }], {});
    expect(cookieStore.set).toHaveBeenCalledWith("session", "next", { path: "/" });
  });
});
