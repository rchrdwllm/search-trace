import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";

describe("OpportunityForm component", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields and submit button", () => {
    render(
      <OpportunityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Opportunity"
      />,
    );

    expect(screen.getByLabelText(/^Company/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Role Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Status/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Source URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Job Description/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Opportunity" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("shows validation errors when submitting required fields empty", async () => {
    const user = userEvent.setup();
    render(
      <OpportunityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    await user.click(screen.getByRole("button", { name: "Save Opportunity" }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Company name is required")).toBeInTheDocument();
    expect(screen.getByText("Role title is required")).toBeInTheDocument();
    expect(screen.getByText("Job description is required")).toBeInTheDocument();
  });

  it("validates that source URLs must use the https protocol", async () => {
    const user = userEvent.setup();
    render(
      <OpportunityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    await user.type(screen.getByLabelText(/^Company/), "Acme");
    await user.type(screen.getByLabelText(/^Role Title/), "Engineer");
    await user.type(screen.getByLabelText(/^Job Description/), "Job details");
    await user.type(
      screen.getByLabelText(/Source URL/),
      "http://insecure-site.com/job",
    );

    await user.click(screen.getByRole("button", { name: "Save Opportunity" }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Source URL must use HTTPS (https://...)"),
    ).toBeInTheDocument();
  });

  it("submits valid trimmed data successfully", async () => {
    const user = userEvent.setup();
    render(
      <OpportunityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    await user.type(screen.getByLabelText(/^Company/), "  Google Inc  ");
    await user.type(screen.getByLabelText(/^Role Title/), "  Staff SWE  ");
    await user.type(
      screen.getByLabelText(/^Job Description/),
      "  Exciting mission  ",
    );
    await user.type(
      screen.getByLabelText(/Source URL/),
      "https://careers.google.com/jobs/123",
    );

    await user.click(screen.getByRole("button", { name: "Save Opportunity" }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      company: "Google Inc",
      role: "Staff SWE",
      jobDescription: "Exciting mission",
      sourceUrl: "https://careers.google.com/jobs/123",
      status: "draft",
    });
  });

  it("invokes onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <OpportunityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("disables inputs and buttons while submitting", () => {
    render(
      <OpportunityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />,
    );

    expect(screen.getByLabelText(/^Company/)).toBeDisabled();
    expect(screen.getByLabelText(/^Role Title/)).toBeDisabled();
    expect(screen.getByLabelText(/^Status/)).toBeDisabled();
    expect(screen.getByLabelText(/^Job Description/)).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Saving/ })).toBeDisabled();
  });
});
