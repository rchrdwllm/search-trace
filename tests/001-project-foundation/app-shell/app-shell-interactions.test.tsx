import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("SearchTrace shell interactions", () => {
  it("starts with the skip link and moves focus to the main target", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.tab();
    expect(document.activeElement).toHaveTextContent("Skip to main content");
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(screen.getByRole("main"));
  });

  it("toggles the retained sidebar with a named control", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const trigger = screen.getByRole("button", { name: "Toggle navigation sidebar" });
    const sidebar = document.querySelector('[data-slot="sidebar"]');

    expect(sidebar).toHaveAttribute("data-state", "expanded");
    await user.click(trigger);
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(trigger).toHaveAccessibleName("Toggle navigation sidebar");
  });
});
