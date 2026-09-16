import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("SearchTrace application shell", () => {
  it("exposes SearchTrace identity, landmarks, skip navigation, and honest scope", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /SearchTrace keeps evidence/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle navigation sidebar" })).toBeInTheDocument();
    expect(screen.getByText(/No account, persistence, analysis/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Opportunity review" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Create Next App|Vercel|Dashboard|Sales|Store|Orders|Products|Customers|Marketing|Efferd/i)).not.toBeInTheDocument();
  });
});
