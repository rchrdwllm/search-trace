import { render, screen } from "@testing-library/react";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import type { OpportunityStatus } from "@/lib/validations/opportunity";

describe("OpportunityCard component", () => {
  const mockOpportunity = {
    id: "opp-123",
    company: "Anthropic",
    role: "Full Stack Engineer",
    status: "interviewing" as OpportunityStatus,
    sourceUrl: "https://example.com/job",
    createdAt: new Date("2026-09-01T10:00:00Z"),
    updatedAt: new Date("2026-09-05T12:00:00Z"),
    lastAnalysisState: "none" as const,
  };

  it("renders role title, company name, and status badge", () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);

    expect(
      screen.getByRole("heading", { name: "Full Stack Engineer" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("Interviewing")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Full Stack Engineer" }),
    ).toHaveAttribute("href", "/dashboard/opportunities/opp-123");
  });

  it("displays formatted updated date", () => {
    render(<OpportunityCard opportunity={mockOpportunity} />);

    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText("No analysis yet")).toBeInTheDocument();
  });
});
