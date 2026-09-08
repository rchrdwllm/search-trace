import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityStatusBadge } from "@/components/opportunities/opportunity-status-badge";
import type { OpportunityStatus } from "@/lib/validations/opportunity";

describe("Opportunity UI accessibility", () => {
  it("OpportunityForm has zero axe violations", async () => {
    const { container } = render(
      <main id="main-content">
        <h1>Create Opportunity</h1>
        <OpportunityForm onSubmit={jest.fn()} onCancel={jest.fn()} />
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("OpportunityCard has zero axe violations", async () => {
    const mockOpportunity = {
      id: "opp-123",
      company: "Acme Corp",
      role: "Platform Engineer",
      status: "applied" as OpportunityStatus,
      sourceUrl: "https://example.com/job",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAnalysisState: "none" as const,
    };

    const { container } = render(
      <main id="main-content">
        <h2>Opportunities</h2>
        <OpportunityCard opportunity={mockOpportunity} />
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("OpportunityStatusBadge has zero axe violations across all statuses", async () => {
    const statuses: OpportunityStatus[] = [
      "draft",
      "applied",
      "interviewing",
      "rejected",
      "closed",
    ];

    for (const status of statuses) {
      const { container } = render(
        <div>
          <OpportunityStatusBadge status={status} />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
