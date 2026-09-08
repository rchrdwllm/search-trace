import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import Home from "@/app/page";

describe("SearchTrace shell accessibility", () => {
  it("has no detectable axe violations", async () => {
    const { container } = render(<Home />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
