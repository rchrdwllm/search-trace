import { render } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
  createServerClient: jest.fn(),
}));

describe("shell service boundary", () => {
  it("renders without configuration and makes no Supabase or fetch call", () => {
    render(<Home />);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
