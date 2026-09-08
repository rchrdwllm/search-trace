import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { FoundationStatus } from "@/components/foundation-status";
import { FoundationSkeleton } from "@/components/foundation-skeleton";

describe("foundation status compositions", () => {
  it("uses polite status semantics for ordinary information and unavailable states", () => {
    render(<><FoundationStatus kind="info">Ready.</FoundationStatus><FoundationStatus kind="unavailable">Not connected.</FoundationStatus></>);
    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getByText("Not connected.")).toBeInTheDocument();
  });

  it("uses an alert for immediate errors and names loading state", () => {
    render(<><FoundationStatus kind="error">Try again.</FoundationStatus><FoundationSkeleton /></>);
    expect(screen.getByRole("alert")).toHaveTextContent("Try again.");
    expect(screen.getByRole("status", { name: "Loading foundation preview" })).toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(<FoundationStatus kind="unavailable">Not configured.</FoundationStatus>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
