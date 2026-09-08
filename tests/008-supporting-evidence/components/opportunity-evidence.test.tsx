import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { OpportunityEvidenceSection } from "@/components/evidence/opportunity-evidence-section";
import { EvidencePickerDialog } from "@/components/evidence/evidence-picker-dialog";
import type { EvidenceItem } from "@/lib/db/schema";

expect.extend(toHaveNoViolations);

const mockSelectedEvidence: EvidenceItem = {
  id: "e0000000-0000-0000-0000-000000000001",
  userId: "user-123",
  title: "Distributed Task Queue",
  description: "Built an in-memory task queue in Go with concurrent worker pools.",
  type: "project",
  sourceUrl: "https://github.com/example/task-queue",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAvailableEvidence: EvidenceItem = {
  id: "e0000000-0000-0000-0000-000000000002",
  userId: "user-123",
  title: "Prometheus Metrics Exporter",
  description: "Instrumented HTTP services with custom Prometheus counters.",
  type: "accomplishment",
  sourceUrl: "https://example.com/blog/metrics",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMutateDetach = jest.fn();
const mockMutateAttach = jest.fn();

interface MockMutationOptions {
  mutationKey?: unknown[];
  onSuccess?: (vars: unknown) => void;
}

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: {
      selected: [mockSelectedEvidence],
      available: [mockAvailableEvidence],
    },
    isLoading: false,
  })),
  useMutation: jest.fn((options?: MockMutationOptions) => ({
    mutate: (vars: unknown) => {
      if (options?.mutationKey?.includes("detach")) {
        mockMutateDetach(vars);
      } else if (options?.mutationKey?.includes("attach")) {
        mockMutateAttach(vars);
      }
      options?.onSuccess?.(vars);
    },
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
      listByOpportunityId: {
        queryOptions: (input: { opportunityId: string }) => ({
          queryKey: ["evidence", "listByOpportunityId", input],
        }),
        queryKey: (input: { opportunityId: string }) => ["evidence", "listByOpportunityId", input],
        queryFilter: () => ({ queryKey: ["evidence", "listByOpportunityId"] }),
      },
      detach: {
        mutationOptions: (opts?: Record<string, unknown>) => ({
          ...opts,
          mutationKey: ["evidence", "detach"],
        }),
      },
      attach: {
        mutationOptions: (opts?: Record<string, unknown>) => ({
          ...opts,
          mutationKey: ["evidence", "attach"],
        }),
      },
      createAndAttach: {
        mutationOptions: (opts?: Record<string, unknown>) => ({
          ...opts,
          mutationKey: ["evidence", "createAndAttach"],
        }),
      },
      update: {
        mutationOptions: (opts?: Record<string, unknown>) => ({
          ...opts,
          mutationKey: ["evidence", "update"],
        }),
      },
    },
  }),
}));

describe("OpportunityEvidenceSection component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders section header, count badge, and selected items", () => {
    render(
      <OpportunityEvidenceSection opportunityId="a0000000-0000-0000-0000-000000000001" />,
    );

    expect(screen.getByText("Supporting Evidence")).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByText("Distributed Task Queue")).toBeInTheDocument();
  });

  it("detaches selected evidence item when detach button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <OpportunityEvidenceSection opportunityId="a0000000-0000-0000-0000-000000000001" />,
    );

    const detachBtn = screen.getByRole("button", {
      name: /detach evidence: distributed task queue/i,
    });
    await user.click(detachBtn);

    expect(mockMutateDetach).toHaveBeenCalledWith({
      opportunityId: "a0000000-0000-0000-0000-000000000001",
      evidenceItemId: "e0000000-0000-0000-0000-000000000001",
    });
  });

  it("opens picker dialog when 'Attach from Library' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <OpportunityEvidenceSection opportunityId="a0000000-0000-0000-0000-000000000001" />,
    );

    const attachBtn = screen.getByRole("button", { name: /attach from library/i });
    await user.click(attachBtn);

    expect(screen.getByText("Attach Evidence from Library")).toBeInTheDocument();
  });

  it("passes accessibility axe audit", async () => {
    const { container } = render(
      <OpportunityEvidenceSection opportunityId="a0000000-0000-0000-0000-000000000001" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("EvidencePickerDialog component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders available unselected items and filters by search", async () => {
    const user = userEvent.setup();
    render(
      <EvidencePickerDialog
        open={true}
        onOpenChange={jest.fn()}
        opportunityId="a0000000-0000-0000-0000-000000000001"
        availableItems={[mockAvailableEvidence]}
      />,
    );

    expect(screen.getByText("Prometheus Metrics Exporter")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    await user.type(searchInput, "Nonexistent");

    expect(
      screen.getByText(/no evidence items matching/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/nonexistent/i)).toBeInTheDocument();
  });

  it("triggers attach mutation when Attach is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EvidencePickerDialog
        open={true}
        onOpenChange={jest.fn()}
        opportunityId="a0000000-0000-0000-0000-000000000001"
        availableItems={[mockAvailableEvidence]}
      />,
    );

    const attachBtn = screen.getByRole("button", {
      name: /attach prometheus metrics exporter/i,
    });
    await user.click(attachBtn);

    expect(mockMutateAttach).toHaveBeenCalledWith({
      opportunityId: "a0000000-0000-0000-0000-000000000001",
      evidenceItemId: "e0000000-0000-0000-0000-000000000002",
    });
  });
});
