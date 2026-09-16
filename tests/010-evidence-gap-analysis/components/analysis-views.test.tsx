import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { AnalysisCoverageSummary } from "@/components/analysis/analysis-coverage-summary";
import { AnalysisNextActionCard } from "@/components/analysis/analysis-next-action-card";
import { AnalysisRequirementItem } from "@/components/analysis/analysis-requirement-item";
import { AnalysisPreflightDialog } from "@/components/analysis/analysis-preflight-dialog";
import { AnalysisDraftReview } from "@/components/analysis/analysis-draft-review";
import type {
  RunAnalysisResponse,
  AnalysisPreFlightResponse,
} from "@/lib/validations/analysis";

expect.extend(toHaveNoViolations);

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    resume: {
      setAiOptIn: {
        mutationOptions: jest.fn((opts?: unknown) => opts),
      },
      getByOpportunityId: {
        queryFilter: jest.fn(),
      },
    },
    analysis: {
      getPreFlight: {
        queryFilter: jest.fn(),
      },
    },
  }),
}));

describe("Evidence-Gap Analysis UI Components", () => {
  const sampleCounts = {
    supported: 2,
    weak: 1,
    missing: 1,
    unknown: 0,
    total: 4,
  };

  const sampleDraft: RunAnalysisResponse = {
    opportunityId: "opp-123",
    evaluations: [
      {
        requirementId: "req-1",
        requirementTitle: "PostgreSQL database design",
        category: "technical_skill",
        jobDescriptionExcerpt: "Experience with PostgreSQL",
        coverageState: "supported",
        citationSource: "resume",
        citationSourceTitle: "Reviewed Résumé",
        citationExcerpt: "Designed relational schemas using PostgreSQL.",
        coverageRationale: "Direct proof found.",
      },
      {
        requirementId: "req-2",
        requirementTitle: "Kubernetes orchestration",
        category: "experience",
        jobDescriptionExcerpt: "Kubernetes in production",
        coverageState: "missing",
        missingEvidenceNotes: "No Kubernetes experience mentioned in candidate materials.",
      },
    ],
    nextAction: {
      text: "Build and deploy a containerized microservice demonstrating Kubernetes deployment.",
      targetRequirementId: "req-2",
      targetRequirementTitle: "Kubernetes orchestration",
    },
    limitations: "Evaluation bounded by submitted materials.",
    summaryCounts: {
      supported: 1,
      weak: 0,
      missing: 1,
      unknown: 0,
      total: 2,
    },
    dailyUsage: {
      used: 1,
      limit: 5,
      remaining: 4,
      resetsAt: "2026-09-10T00:00:00Z",
    },
  };

  describe("AnalysisCoverageSummary", () => {
    it("renders all 4 coverage states with accurate counts", () => {
      render(<AnalysisCoverageSummary counts={sampleCounts} />);

      expect(screen.getByTestId("coverage-count-supported")).toHaveTextContent("2");
      expect(screen.getByTestId("coverage-count-weak")).toHaveTextContent("1");
      expect(screen.getByTestId("coverage-count-missing")).toHaveTextContent("1");
      expect(screen.getByTestId("coverage-count-unknown")).toHaveTextContent("0");
    });

    it("renders evidence utilization panel when evidenceStats are provided", () => {
      render(
        <AnalysisCoverageSummary
          counts={sampleCounts}
          evidenceStats={{
            citedEvidenceCount: 1,
            totalEvidenceCount: 3,
            citedEvidenceTitles: ["Project Alpha"],
          }}
        />
      );

      expect(screen.getByTestId("evidence-utilization-panel")).toBeInTheDocument();
      expect(screen.getByText(/1 of 3 attached items cited as proof/i)).toBeInTheDocument();
      expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
      const { container } = render(<AnalysisCoverageSummary counts={sampleCounts} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("AnalysisNextActionCard", () => {
    it("renders focus recommendation and target requirement title", () => {
      render(
        <AnalysisNextActionCard
          text="Build a deployed project with Docker and Kubernetes."
          targetRequirementTitle="Kubernetes orchestration"
        />
      );

      expect(
        screen.getByText("Build a deployed project with Docker and Kubernetes.")
      ).toBeInTheDocument();
      expect(screen.getByText("Kubernetes orchestration")).toBeInTheDocument();
      expect(
        screen.queryByText(/SearchTrace does not calculate hiring probabilities/i)
      ).not.toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
      const { container } = render(
        <AnalysisNextActionCard
          text="Build a deployed project with Docker and Kubernetes."
          targetRequirementTitle="Kubernetes orchestration"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("AnalysisRequirementItem", () => {
    it("renders requirement with category badge, JD excerpt, and verbatim citation", () => {
      render(
        <AnalysisRequirementItem
          id="req-1"
          title="PostgreSQL database design"
          category="technical_skill"
          jobDescriptionExcerpt="Experience with PostgreSQL"
          coverageState="supported"
          citationSource="resume"
          citationSourceTitle="Reviewed Résumé"
          citationExcerpt="Designed relational schemas using PostgreSQL."
        />
      );

      expect(screen.getByText("PostgreSQL database design")).toBeInTheDocument();
      expect(screen.getByText("Technical Skill")).toBeInTheDocument();
      expect(screen.getByText('"Experience with PostgreSQL"')).toBeInTheDocument();
      expect(
        screen.getByText('"Designed relational schemas using PostgreSQL."')
      ).toBeInTheDocument();
      expect(screen.getByText("Reviewed Résumé")).toBeInTheDocument();
    });

    it("renders missing evidence notes when coverageState is missing", () => {
      render(
        <AnalysisRequirementItem
          id="req-2"
          title="Kubernetes orchestration"
          category="experience"
          jobDescriptionExcerpt="Kubernetes in production"
          coverageState="missing"
          missingEvidenceNotes="No Kubernetes proof found in candidate materials."
        />
      );

      expect(
        screen.getByText("No Kubernetes proof found in candidate materials.")
      ).toBeInTheDocument();
    });

    it("renders external link when citationSourceUrl is provided", () => {
      render(
        <AnalysisRequirementItem
          id="req-1"
          title="PostgreSQL database design"
          category="technical_skill"
          jobDescriptionExcerpt="Experience with PostgreSQL"
          coverageState="supported"
          citationSource="evidence"
          citationSourceTitle="Redis Rate Limiter"
          citationSourceUrl="https://github.com/example/redis-rate-limiter"
          citationExcerpt="Implemented sliding-window rate limiter."
        />
      );

      const link = screen.getByTestId("evidence-citation-link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://github.com/example/redis-rate-limiter");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("invokes onOverrideState when state button is clicked in editable mode", async () => {
      const user = userEvent.setup();
      const onOverride = jest.fn();

      render(
        <AnalysisRequirementItem
          id="req-1"
          title="PostgreSQL database design"
          category="technical_skill"
          jobDescriptionExcerpt="Experience with PostgreSQL"
          coverageState="weak"
          isEditable={true}
          onOverrideState={onOverride}
        />
      );

      const supportedButton = screen.getByRole("button", { name: "Supported" });
      await user.click(supportedButton);

      expect(onOverride).toHaveBeenCalledWith("supported");
    });
  });

  describe("AnalysisPreflightDialog", () => {
    const readyPreflight: AnalysisPreFlightResponse = {
      isReady: true,
      reasons: [],
      requirementsCount: 3,
      resumeStatus: {
        exists: true,
        extractionState: "ready",
        aiOptIn: true,
      },
      selectedEvidenceCount: 2,
      selectedEvidenceTitles: ["Project A", "Project B"],
      optedInFeedbackCount: 1,
      dailyUsage: {
        used: 1,
        limit: 5,
        remaining: 4,
        resetsAt: "2026-09-10T00:00:00Z",
      },
    };

    it("enables Start Analysis when prerequisites are met", async () => {
      const user = userEvent.setup();
      const onStart = jest.fn();

      render(
        <AnalysisPreflightDialog
          open={true}
          onOpenChange={jest.fn()}
          opportunityId="opp-1"
          preFlightData={readyPreflight}
          isLoadingPreflight={false}
          onStartAnalysis={onStart}
          isAnalyzing={false}
        />
      );

      expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
      expect(screen.getByText(/1 items included/i)).toBeInTheDocument();

      const startButton = screen.getByRole("button", { name: "Start Analysis" });
      expect(startButton).toBeEnabled();

      await user.click(startButton);
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it("disables Start Analysis and shows alerts when prerequisites are missing", () => {
      const notReadyPreflight: AnalysisPreFlightResponse = {
        ...readyPreflight,
        isReady: false,
        reasons: ["AI opt-in consent must be enabled for the reviewed résumé."],
        resumeStatus: {
          exists: true,
          extractionState: "ready",
          aiOptIn: false,
        },
      };

      render(
        <AnalysisPreflightDialog
          open={true}
          onOpenChange={jest.fn()}
          opportunityId="opp-1"
          preFlightData={notReadyPreflight}
          isLoadingPreflight={false}
          onStartAnalysis={jest.fn()}
          isAnalyzing={false}
        />
      );

      expect(
        screen.getByText("AI opt-in consent must be enabled for the reviewed résumé.")
      ).toBeInTheDocument();

      const startButton = screen.getByRole("button", { name: "Start Analysis" });
      expect(startButton).toBeDisabled();
    });
  });

  describe("AnalysisDraftReview", () => {
    it("allows overriding coverage state and saves updated evaluations", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      const onDiscard = jest.fn();

      render(
        <AnalysisDraftReview
          draft={sampleDraft}
          onSave={onSave}
          onDiscard={onDiscard}
          isSaving={false}
        />
      );

      // Find req-2 (currently missing) and click 'Supported' button to override
      const supportedButtons = screen.getAllByRole("button", { name: "Supported" });
      // The second item's Supported button
      await user.click(supportedButtons[1]);

      // Edit next action text
      const nextActionInput = screen.getByDisplayValue(sampleDraft.nextAction.text);
      await user.clear(nextActionInput);
      await user.type(nextActionInput, "Updated custom next action for deployment.");

      // Click save assessment
      const saveButton = screen.getByRole("button", { name: "Save Assessment" });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledTimes(1);
      const [savedEvaluations, savedNextAction] = onSave.mock.calls[0];
      expect(savedEvaluations[1].coverageState).toBe("supported");
      expect(savedNextAction.text).toBe("Updated custom next action for deployment.");
    });

    it("invokes onDiscard when discard button is clicked", async () => {
      const user = userEvent.setup();
      const onDiscard = jest.fn();

      render(
        <AnalysisDraftReview
          draft={sampleDraft}
          onSave={jest.fn()}
          onDiscard={onDiscard}
          isSaving={false}
        />
      );

      const discardButton = screen.getByRole("button", { name: "Discard Draft" });
      await user.click(discardButton);

      expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it("displays evidence utilization panel based on evaluations", () => {
      const draftWithEvidence = {
        ...sampleDraft,
        evaluations: [
          ...sampleDraft.evaluations,
          {
            requirementId: "req-3",
            requirementTitle: "Redis caching",
            category: "technical_skill" as const,
            jobDescriptionExcerpt: "Redis caching",
            coverageState: "supported" as const,
            citationSource: "evidence" as const,
            citationSourceTitle: "Redis Project",
            citationExcerpt: "Configured Redis cache.",
          },
        ],
      };

      render(
        <AnalysisDraftReview
          draft={draftWithEvidence}
          onSave={jest.fn()}
          onDiscard={jest.fn()}
          isSaving={false}
          totalEvidenceCount={2}
        />
      );

      const panel = screen.getByTestId("evidence-utilization-panel");
      expect(panel).toBeInTheDocument();
      expect(screen.getByText(/1 of 2 attached items cited as proof/i)).toBeInTheDocument();
      expect(within(panel).getByText("Redis Project")).toBeInTheDocument();
    });
  });
});
