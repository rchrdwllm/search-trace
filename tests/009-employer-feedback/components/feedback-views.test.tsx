import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { FeedbackSourceBadge } from "@/components/feedback/feedback-source-badge";
import { FeedbackProvenanceBadge } from "@/components/feedback/feedback-provenance-badge";
import { FeedbackEmptyState } from "@/components/feedback/feedback-empty-state";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { FeedbackFormDialog } from "@/components/feedback/feedback-form-dialog";
import { FeedbackDeleteDialog } from "@/components/feedback/feedback-delete-dialog";
import { OpportunityFeedbackSection } from "@/components/feedback/opportunity-feedback-section";
import type { FeedbackItem } from "@/lib/db/schema";

expect.extend(toHaveNoViolations);

interface MockMutationOptions {
  onSuccess?: (vars: unknown) => void;
  mutationKey?: unknown[];
}

const mockMutate = jest.fn();

jest.mock("@tanstack/react-query", () => {
  return {
    useQuery: jest.fn(() => ({
      data: [
        {
          id: "fb-1",
          opportunityId: "opp-1",
          userId: "user-123",
          feedbackDate: "2026-09-08",
          text: "Impressed with system design, but needs hands-on Kubernetes experience.",
          sourceType: "interview_feedback" as const,
          provenance: "exact_quote" as const,
          aiOptIn: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })),
    useMutation: jest.fn((options?: MockMutationOptions) => ({
      mutate: (...args: unknown[]) => {
        mockMutate(...args);
        options?.onSuccess?.(args[0]);
      },
      mutateAsync: jest.fn(),
      isPending: false,
    })),
    useQueryClient: () => ({
      invalidateQueries: jest.fn(),
    }),
  };
});

jest.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    feedback: {
      create: {
        mutationOptions: (opts?: MockMutationOptions) => ({
          ...opts,
          mutationKey: ["feedback", "create"],
        }),
      },
      update: {
        mutationOptions: (opts?: MockMutationOptions) => ({
          ...opts,
          mutationKey: ["feedback", "update"],
        }),
      },
      setAiOptIn: {
        mutationOptions: (opts?: MockMutationOptions) => ({
          ...opts,
          mutationKey: ["feedback", "setAiOptIn"],
        }),
      },
      delete: {
        mutationOptions: (opts?: MockMutationOptions) => ({
          ...opts,
          mutationKey: ["feedback", "delete"],
        }),
      },
      listByOpportunityId: {
        queryKey: (input: { opportunityId: string }) => [
          "feedback",
          "listByOpportunityId",
          input,
        ],
        queryOptions: (input: { opportunityId: string }) => ({
          queryKey: ["feedback", "listByOpportunityId", input],
        }),
      },
      byId: {
        queryKey: (input: { id: string }) => ["feedback", "byId", input],
      },
    },
  }),
}));

const sampleFeedback: FeedbackItem = {
  id: "fb-1",
  opportunityId: "opp-1",
  userId: "user-123",
  feedbackDate: "2026-09-08",
  text: "Impressed with system design, but needs hands-on Kubernetes experience.",
  sourceType: "interview_feedback",
  provenance: "exact_quote",
  aiOptIn: false,
  createdAt: new Date("2026-09-08T10:00:00Z"),
  updatedAt: new Date("2026-09-08T10:00:00Z"),
};

describe("FeedbackSourceBadge component", () => {
  it("renders all 4 source labels correctly", () => {
    const { rerender } = render(
      <FeedbackSourceBadge sourceType="recruiter_feedback" />,
    );
    expect(screen.getByText("Recruiter Feedback")).toBeInTheDocument();

    rerender(<FeedbackSourceBadge sourceType="rejection_note" />);
    expect(screen.getByText("Rejection Note")).toBeInTheDocument();

    rerender(<FeedbackSourceBadge sourceType="interview_feedback" />);
    expect(screen.getByText("Interview Feedback")).toBeInTheDocument();

    rerender(<FeedbackSourceBadge sourceType="user_summary" />);
    expect(screen.getByText("User Summary")).toBeInTheDocument();
  });

  it("passes accessibility checks", async () => {
    const { container } = render(
      <FeedbackSourceBadge sourceType="interview_feedback" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FeedbackProvenanceBadge component", () => {
  it("renders Exact Quote and Personal Summary badges", () => {
    const { rerender } = render(
      <FeedbackProvenanceBadge provenance="exact_quote" />,
    );
    expect(screen.getByText("Exact Quote")).toBeInTheDocument();

    rerender(<FeedbackProvenanceBadge provenance="personal_summary" />);
    expect(screen.getByText("Personal Summary")).toBeInTheDocument();
  });

  it("passes accessibility checks", async () => {
    const { container } = render(
      <FeedbackProvenanceBadge provenance="exact_quote" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FeedbackEmptyState component", () => {
  it("renders empty state message and triggers callback", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(<FeedbackEmptyState onAddFeedback={onAdd} />);

    expect(
      screen.getByText("No employer feedback recorded"),
    ).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /add feedback/i });
    await user.click(btn);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("passes accessibility checks", async () => {
    const { container } = render(<FeedbackEmptyState />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FeedbackCard component", () => {
  it("renders card metadata, plain text, badges, and action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <FeedbackCard
        item={sampleFeedback}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(
      screen.getByText(
        "Impressed with system design, but needs hands-on Kubernetes experience.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Interview Feedback")).toBeInTheDocument();
    expect(screen.getByText("Exact Quote")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit feedback/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete feedback/i }),
    ).toBeInTheDocument();
  });

  it("renders AI opt-in checkbox defaulted to false and handles toggle", async () => {
    const user = userEvent.setup();
    mockMutate.mockClear();

    render(
      <FeedbackCard
        item={sampleFeedback}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /include in ai analysis/i,
    });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(mockMutate).toHaveBeenCalledWith({
      id: sampleFeedback.id,
      aiOptIn: true,
    });
  });

  it("neutralizes script tags and renders text safely as plain text", () => {
    const maliciousItem: FeedbackItem = {
      ...sampleFeedback,
      id: "malicious-1",
      text: "<script>alert('xss')</script>Safe feedback text <img src=x onerror=alert(1)>",
    };

    render(
      <FeedbackCard
        item={maliciousItem}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.getByText(
        "<script>alert('xss')</script>Safe feedback text <img src=x onerror=alert(1)>",
      ),
    ).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("passes accessibility checks", async () => {
    const { container } = render(
      <FeedbackCard
        item={sampleFeedback}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FeedbackFormDialog component", () => {
  it("renders privacy warning notice against pasting recruiter contact details", () => {
    render(
      <FeedbackFormDialog
        open={true}
        onOpenChange={jest.fn()}
        opportunityId="opp-1"
      />,
    );

    expect(screen.getByText(/privacy notice:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /please do not paste recruiter email addresses, phone numbers, signatures, or private email headers/i,
      ),
    ).toBeInTheDocument();
  });

  it("pre-fills existing data when editing", () => {
    render(
      <FeedbackFormDialog
        open={true}
        onOpenChange={jest.fn()}
        opportunityId="opp-1"
        feedback={sampleFeedback}
      />,
    );

    expect(screen.getByDisplayValue("2026-09-08")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(
        "Impressed with system design, but needs hands-on Kubernetes experience.",
      ),
    ).toBeInTheDocument();
  });
});

describe("FeedbackDeleteDialog component", () => {
  it("renders confirmation alert dialog and invokes delete mutation on confirm", async () => {
    const user = userEvent.setup();
    mockMutate.mockClear();

    render(
      <FeedbackDeleteDialog
        open={true}
        onOpenChange={jest.fn()}
        feedback={sampleFeedback}
      />,
    );

    expect(
      screen.getByText(
        /are you sure you want to permanently delete this feedback entry\?/i,
      ),
    ).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: /delete feedback/i });
    await user.click(deleteBtn);
    expect(mockMutate).toHaveBeenCalledWith({ id: sampleFeedback.id });
  });
});

describe("OpportunityFeedbackSection component", () => {
  it("renders Reported Signal header and non-causality disclaimer notice", () => {
    render(<OpportunityFeedbackSection opportunityId="opp-1" />);

    expect(screen.getByText("Employer Feedback")).toBeInTheDocument();
    expect(screen.getByText("Reported Signal")).toBeInTheDocument();
    expect(screen.getByText(/reported signal notice:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /searchtrace never presents feedback as verified proof of a rejection cause or hiring probability\./i,
      ),
    ).toBeInTheDocument();
  });

  it("passes accessibility checks", async () => {
    const { container } = render(
      <OpportunityFeedbackSection opportunityId="opp-1" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
