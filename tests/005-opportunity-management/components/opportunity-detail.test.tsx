import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { OpportunityPageNavigation } from "@/components/opportunities/opportunity-page-navigation";
import { OpportunityNextStep } from "@/components/opportunities/opportunity-next-step";

const mockQuery = jest.fn();
jest.mock("@/trpc/client", () => ({
  useTRPC: () => ({ analysis: { getSummary: { queryOptions: (input: unknown) => input } } }),
}));
jest.mock("@tanstack/react-query", () => ({ useQuery: (...args: unknown[]) => mockQuery(...args) }));

describe("Opportunity detail workspace", () => {
  it("provides accessible section navigation and follows the visible section", async () => {
    const { container } = render(<><OpportunityPageNavigation /><section id="overview" /><section id="resume" /><section id="evidence" /></>);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "#overview");
    expect(screen.getAllByRole("link")).toHaveLength(6);
    const evidence = container.querySelector("#evidence")!;
    jest.spyOn(evidence, "getBoundingClientRect").mockReturnValue({ top: 100 } as DOMRect);
    fireEvent.scroll(window);
    expect(screen.getByRole("link", { name: "Evidence" })).toHaveAttribute("aria-current", "location");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the saved next action and updates when the summary changes", async () => {
    mockQuery.mockReturnValue({ data: { nextAction: { text: "Clarify your accessibility contribution." } } });
    const { rerender, container } = render(<OpportunityNextStep opportunityId="opp-1" />);
    expect(screen.getByRole("heading", { name: "Clarify your accessibility contribution." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open supporting evidence" })).toHaveAttribute("href", "#evidence");
    mockQuery.mockReturnValue({ data: { nextAction: { text: "Document the measured result." } } });
    rerender(<OpportunityNextStep opportunityId="opp-1" />);
    expect(screen.getByRole("heading", { name: "Document the measured result." })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("distinguishes an unavailable summary from an opportunity without a review", () => {
    const refetch = jest.fn();
    mockQuery.mockReturnValue({ isError: true, refetch });
    const { rerender } = render(<OpportunityNextStep opportunityId="opp-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("link", { name: "Review requirements" })).not.toBeInTheDocument();
    mockQuery.mockReturnValue({ data: { nextAction: null } });
    rerender(<OpportunityNextStep opportunityId="opp-1" />);
    expect(screen.getByRole("link", { name: "Review requirements" })).toHaveAttribute("href", "#requirements");
  });
});
