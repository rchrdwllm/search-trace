import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { EvidenceTypeBadge } from "@/components/evidence/evidence-type-badge";
import { EvidenceCard } from "@/components/evidence/evidence-card";
import { EvidenceEmptyState } from "@/components/evidence/evidence-empty-state";
import { EvidenceFormDialog } from "@/components/evidence/evidence-form-dialog";
import { EvidenceDeleteDialog } from "@/components/evidence/evidence-delete-dialog";
import type { EvidenceItem } from "@/lib/db/schema";

expect.extend(toHaveNoViolations);

const mockAttachedOpportunities = [
  {
    opportunityId: "opp-1",
    company: "Acme Corp",
    role: "Staff Engineer",
  },
];

interface MockQueryOptions {
  input?: { id?: string };
  queryKey?: unknown[];
}

interface MockMutationOptions {
  onSuccess?: (vars: unknown) => void;
  mutationKey?: unknown[];
}

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((options?: MockQueryOptions) => {
    const isAttached = options?.input?.id === "attached-id" ||
      (options?.queryKey && JSON.stringify(options.queryKey).includes("attached-id"));
    if (isAttached) {
      return {
        data: mockAttachedOpportunities,
        isLoading: false,
      };
    }
    return {
      data: [],
      isLoading: false,
    };
  }),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    evidence: {
      create: {
        mutationOptions: (opts?: MockMutationOptions) => ({ ...opts, mutationKey: ["evidence", "create"] }),
      },
      update: {
        mutationOptions: (opts?: MockMutationOptions) => ({ ...opts, mutationKey: ["evidence", "update"] }),
      },
      createAndAttach: {
        mutationOptions: (opts?: MockMutationOptions) => ({ ...opts, mutationKey: ["evidence", "createAndAttach"] }),
      },
      delete: {
        mutationOptions: (opts?: MockMutationOptions) => ({ ...opts, mutationKey: ["evidence", "delete"] }),
      },
      getAttachedOpportunities: {
        queryOptions: (input: { id: string }, opts?: Record<string, unknown>) => ({
          queryKey: ["evidence", "getAttachedOpportunities", input],
          input,
          ...opts,
        }),
      },
      list: {
        queryKey: () => ["evidence", "list"],
        queryOptions: (_input?: unknown, opts?: Record<string, unknown>) => ({
          queryKey: ["evidence", "list"],
          ...opts,
        }),
      },
      byId: {
        queryKey: (input: { id: string }) => ["evidence", "byId", input],
      },
      listByOpportunityId: {
        queryKey: (input: { opportunityId: string }) => ["evidence", "listByOpportunityId", input],
        queryFilter: () => ({ queryKey: ["evidence", "listByOpportunityId"] }),
      },
    },
  }),
}));

const mockEvidence: EvidenceItem = {
  id: "e0000000-0000-0000-0000-000000000001",
  userId: "user-123",
  title: "Distributed Task Queue",
  description: "Built an in-memory task queue in Go with concurrent worker pools.",
  type: "project",
  sourceUrl: "https://github.com/example/task-queue",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("EvidenceTypeBadge component", () => {
  it("renders correct labels for all evidence types", () => {
    const { rerender } = render(<EvidenceTypeBadge type="project" />);
    expect(screen.getByText("Project")).toBeInTheDocument();

    rerender(<EvidenceTypeBadge type="accomplishment" />);
    expect(screen.getByText("Accomplishment")).toBeInTheDocument();

    rerender(<EvidenceTypeBadge type="portfolio_link" />);
    expect(screen.getByText("Portfolio Link")).toBeInTheDocument();
  });
});

describe("EvidenceCard component", () => {
  it("renders title, description, badge, and source link", () => {
    render(<EvidenceCard evidence={mockEvidence} />);

    expect(screen.getByText("Distributed Task Queue")).toBeInTheDocument();
    expect(
      screen.getByText("Built an in-memory task queue in Go with concurrent worker pools."),
    ).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/example/task-queue",
    );
  });

  it("renders content safely as plain text to prevent script execution", () => {
    const maliciousEvidence: EvidenceItem = {
      ...mockEvidence,
      id: "malicious-id",
      title: "<script>alert('xss')</script>Safe Title",
      description: "<img src=x onerror=alert(1)>Safe Description",
    };

    render(<EvidenceCard evidence={maliciousEvidence} />);

    expect(
      screen.getByText("<script>alert('xss')</script>Safe Title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("<img src=x onerror=alert(1)>Safe Description"),
    ).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("triggers edit and delete callbacks when clicked", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <EvidenceCard
        evidence={mockEvidence}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const editBtn = screen.getByRole("button", {
      name: /edit evidence: distributed task queue/i,
    });
    const deleteBtn = screen.getByRole("button", {
      name: /delete evidence: distributed task queue/i,
    });

    await user.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockEvidence);

    await user.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockEvidence);
  });

  it("renders detach button in opportunity view mode", async () => {
    const user = userEvent.setup();
    const onDetach = jest.fn();

    render(
      <EvidenceCard
        evidence={mockEvidence}
        isOpportunityView={true}
        onDetach={onDetach}
      />,
    );

    const detachBtn = screen.getByRole("button", {
      name: /detach evidence: distributed task queue/i,
    });
    expect(detachBtn).toBeInTheDocument();

    await user.click(detachBtn);
    expect(onDetach).toHaveBeenCalledWith(mockEvidence);
  });

  it("passes accessibility axe audit", async () => {
    const { container } = render(<EvidenceCard evidence={mockEvidence} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("EvidenceEmptyState component", () => {
  it("renders empty state message and triggers CTA", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<EvidenceEmptyState onAddEvidence={onAdd} />);

    expect(screen.getByText("No evidence items yet")).toBeInTheDocument();
    const addBtn = screen.getByRole("button", { name: /add evidence item/i });
    await user.click(addBtn);
    expect(onAdd).toHaveBeenCalled();
  });
});

describe("EvidenceFormDialog component", () => {
  it("renders form inputs with initial values when open", () => {
    render(
      <EvidenceFormDialog
        open={true}
        onOpenChange={jest.fn()}
        evidence={mockEvidence}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Distributed Task Queue")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://github.com/example/task-queue")).toBeInTheDocument();
  });

  it("validates that source link uses HTTPS", async () => {
    const user = userEvent.setup();
    render(
      <EvidenceFormDialog
        open={true}
        onOpenChange={jest.fn()}
      />,
    );

    const titleInput = screen.getByLabelText("Title");
    const descInput = screen.getByLabelText("Description");
    const linkInput = screen.getByLabelText(/source link/i);

    await user.type(titleInput, "Valid Title");
    await user.type(descInput, "Valid Description");
    await user.type(linkInput, "http://insecure-link.com");

    const submitBtn = screen.getByRole("button", { name: /create evidence/i });
    await user.click(submitBtn);

    expect(screen.getByText("Source URL must use HTTPS")).toBeInTheDocument();
  });
});

describe("EvidenceDeleteDialog component", () => {
  it("shows cascade warning when attached to opportunities", () => {
    render(
      <EvidenceDeleteDialog
        open={true}
        onOpenChange={jest.fn()}
        evidence={{
          ...mockEvidence,
          id: "attached-id",
        }}
      />,
    );

    expect(screen.getByText(/attached to 1 opportunity/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
  });

  it("shows standard message when not attached to opportunities", () => {
    render(
      <EvidenceDeleteDialog
        open={true}
        onOpenChange={jest.fn()}
        evidence={mockEvidence}
      />,
    );

    expect(
      screen.getByText(/this item is not currently attached to any opportunities/i),
    ).toBeInTheDocument();
  });
});
