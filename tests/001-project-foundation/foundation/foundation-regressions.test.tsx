import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("foundation regressions", () => {
  it("does not restore starter content or fake deferred actions", () => {
    render(<Home />);
    const source = fs.readFileSync(path.join(process.cwd(), "app", "page.tsx"), "utf8");
    expect(source).not.toMatch(/next\.svg|vercel\.svg|Templates|Documentation|Deploy Now/);
    expect(screen.queryByRole("link", { name: /opportunity|workspace/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start an evidence review" })).toBeDisabled();
  });

  it("keeps the one primary main landmark and avoids shell remote calls", () => {
    render(<Home />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
