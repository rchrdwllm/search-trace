import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/(app)/layout";

describe("private workspace shell continuity", () => {
  it("keeps the shared shell and its single primary landmark around dashboard content", () => {
    render(
      <DashboardLayout>
        <section aria-labelledby="test-dashboard-title">
          <h1 id="test-dashboard-title">Private dashboard content</h1>
        </section>
      </DashboardLayout>,
    );

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Private dashboard content" })).toBeInTheDocument();
  });
});
