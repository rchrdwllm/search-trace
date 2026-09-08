import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { RequirementQuotaAlert } from "@/components/requirements/requirement-quota-alert";
import { RequirementDraftBanner } from "@/components/requirements/requirement-draft-banner";
import { RequirementCard } from "@/components/requirements/requirement-card";
import { RequirementEmptyState } from "@/components/requirements/requirement-empty-state";
import { RequirementEditDialog } from "@/components/requirements/requirement-edit-dialog";
import { RequirementAddDialog } from "@/components/requirements/requirement-add-dialog";
import { RequirementReextractDialog } from "@/components/requirements/requirement-reextract-dialog";

expect.extend(toHaveNoViolations);

describe("RequirementQuotaAlert component", () => {
  it("renders remaining quota indicator when quota is available", () => {
    render(<RequirementQuotaAlert used={2} limit={5} remaining={3} />);

    expect(screen.getByText(/3 of 5 extractions remaining today/i)).toBeInTheDocument();
    expect(screen.getByText(/Gemini 3.6 Flash requirement analysis/i)).toBeInTheDocument();
  });

  it("renders alert warning when quota is exhausted", () => {
    render(<RequirementQuotaAlert used={5} limit={5} remaining={0} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Daily AI Extraction Limit Reached/i)).toBeInTheDocument();
    expect(screen.getByText(/used all 5 of your daily extraction requests/i)).toBeInTheDocument();
  });
});

describe("RequirementDraftBanner component", () => {
  it("renders draft count and action buttons", () => {
    const onSave = jest.fn();
    const onDiscard = jest.fn();
    const onAdd = jest.fn();

    render(
      <RequirementDraftBanner
        count={6}
        onSave={onSave}
        onDiscard={onDiscard}
        onAdd={onAdd}
      />
    );

    expect(screen.getByText(/Reviewing Draft Requirements \(6\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Unsaved/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Requirements/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Discard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add/i })).toBeInTheDocument();
  });

  it("triggers callbacks on button clicks", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const onDiscard = jest.fn();
    const onAdd = jest.fn();

    render(
      <RequirementDraftBanner
        count={6}
        onSave={onSave}
        onDiscard={onDiscard}
        onAdd={onAdd}
      />
    );

    await user.click(screen.getByRole("button", { name: /Save Requirements/i }));
    expect(onSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Discard/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Add/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe("RequirementCard component", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  it("renders requirement title, category badge, and cited excerpt", () => {
    render(
      <RequirementCard
        title="5+ years of React and TypeScript experience"
        category="technical_skill"
        jobDescriptionExcerpt="Requires 5+ years building production applications with React and TypeScript."
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("5+ years of React and TypeScript experience")).toBeInTheDocument();
    expect(screen.getByText("Technical Skill")).toBeInTheDocument();
    expect(
      screen.getByText(/Requires 5\+ years building production applications with React and TypeScript\./i)
    ).toBeInTheDocument();
  });

  it("triggers edit and delete actions", async () => {
    const user = userEvent.setup();

    render(
      <RequirementCard
        title="Senior engineering experience"
        category="experience"
        jobDescriptionExcerpt="Led distributed engineering teams."
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await user.click(screen.getByRole("button", { name: /Edit requirement/i }));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Delete requirement/i }));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});

describe("RequirementEmptyState component", () => {
  it("renders call to action buttons and triggers callbacks", async () => {
    const user = userEvent.setup();
    const onExtract = jest.fn();
    const onAdd = jest.fn();

    render(<RequirementEmptyState onExtract={onExtract} onAdd={onAdd} />);

    expect(screen.getByText("No Requirements Extracted")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Extract Requirements/i }));
    expect(onExtract).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Add Manually/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe("RequirementEditDialog component", () => {
  const sampleJd = "We require 5+ years of production TypeScript and Node.js experience.";

  it("displays current values and validates verbatim matches", () => {
    render(
      <RequirementEditDialog
        open={true}
        onOpenChange={jest.fn()}
        requirement={{
          title: "TypeScript expertise",
          category: "technical_skill",
          jobDescriptionExcerpt: "5+ years of production TypeScript",
        }}
        jobDescription={sampleJd}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue("TypeScript expertise")).toBeInTheDocument();
    expect(screen.getByText(/Verbatim Match/i)).toBeInTheDocument();
  });
});

describe("RequirementAddDialog component", () => {
  it("renders and adds a custom requirement", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(
      <RequirementAddDialog
        open={true}
        onOpenChange={jest.fn()}
        jobDescription="Must have 5+ years of experience in Python."
        onAdd={onAdd}
      />
    );

    expect(screen.getByText("Add Custom Requirement")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Requirement Statement/i), "Python experience");
    await user.type(screen.getByLabelText(/Job Description Citation Excerpt/i), "5+ years of experience in Python");
    await user.click(screen.getByRole("button", { name: /^Add Requirement$/i }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "Python experience",
      category: "technical_skill",
      jobDescriptionExcerpt: "5+ years of experience in Python",
    });
  });
});

describe("RequirementReextractDialog component", () => {
  it("renders warning description and triggers confirm callback", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    render(
      <RequirementReextractDialog
        open={true}
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText("Re-extract Requirements?")).toBeInTheDocument();
    expect(screen.getByText(/Re-extracting will generate a new draft/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Re-extract Requirements/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe("Accessibility audit", () => {
  it("RequirementCard has no axe accessibility violations", async () => {
    const { container } = render(
      <RequirementCard
        title="Automated testing proficiency"
        category="technical_skill"
        jobDescriptionExcerpt="Demonstrated background with Jest and Playwright."
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("RequirementDraftBanner has no axe accessibility violations", async () => {
    const { container } = render(
      <RequirementDraftBanner
        count={5}
        onSave={jest.fn()}
        onDiscard={jest.fn()}
        onAdd={jest.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
