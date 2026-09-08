import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeUploadDropzone } from "@/components/resumes/resume-upload-dropzone";
import { ResumeCard } from "@/components/resumes/resume-card";
import { ResumeReviewEditor } from "@/components/resumes/resume-review-editor";
import { ResumeAiConsentToggle } from "@/components/resumes/resume-ai-consent-toggle";
import { ResumeExtractionAlert } from "@/components/resumes/resume-extraction-alert";
import { ResumeDeleteDialog } from "@/components/resumes/resume-delete-dialog";
import { ResumeReplaceDialog } from "@/components/resumes/resume-replace-dialog";

describe("ResumeUploadDropzone component", () => {
  it("renders upload instructions and file input", () => {
    render(<ResumeUploadDropzone opportunityId="opp-1" />);

    expect(screen.getByText(/Upload your résumé used for this application/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF or DOCX format, up to 10 MB/i)).toBeInTheDocument();
  });

  it("shows error when selecting an invalid file format", async () => {
    render(<ResumeUploadDropzone opportunityId="opp-1" />);

    const file = new File(["fake image content"], "avatar.png", { type: "image/png" });
    const input = document.getElementById("resume-upload-opp-1") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole("alert")).toHaveTextContent(/Only PDF and DOCX documents are accepted/i);
  });
});

describe("ResumeCard component", () => {
  const mockOnDownload = jest.fn();
  const mockOnReplace = jest.fn();
  const mockOnDelete = jest.fn();

  it("renders document metadata and action buttons", () => {
    render(
      <ResumeCard
        fileName="Jane_Doe_Resume.pdf"
        fileSize={245100}
        fileType="application/pdf"
        extractionState="ready"
        createdAt={new Date("2026-09-08T12:00:00Z")}
        onDownload={mockOnDownload}
        onReplace={mockOnReplace}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Jane_Doe_Resume.pdf")).toBeInTheDocument();
    expect(screen.getByText(/239 KB/i)).toBeInTheDocument();
    expect(screen.getByText(/Extraction ready/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download Jane_Doe_Resume.pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Replace Jane_Doe_Resume.pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete Jane_Doe_Resume.pdf/i })).toBeInTheDocument();
  });

  it("triggers callbacks on action button clicks", async () => {
    const user = userEvent.setup();
    render(
      <ResumeCard
        fileName="Jane_Doe_Resume.pdf"
        fileSize={245100}
        fileType="application/pdf"
        extractionState="ready"
        createdAt={new Date("2026-09-08T12:00:00Z")}
        onDownload={mockOnDownload}
        onReplace={mockOnReplace}
        onDelete={mockOnDelete}
      />
    );

    await user.click(screen.getByRole("button", { name: /Download Jane_Doe_Resume.pdf/i }));
    expect(mockOnDownload).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Replace Jane_Doe_Resume.pdf/i }));
    expect(mockOnReplace).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Delete Jane_Doe_Resume.pdf/i }));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});

describe("ResumeReviewEditor component", () => {
  const mockOnSave = jest.fn();

  it("renders preview mode with word count and toggle to edit mode", async () => {
    const user = userEvent.setup();
    render(
      <ResumeReviewEditor
        reviewedText="Experienced software engineer with 5 years in TypeScript."
        onSaveText={mockOnSave}
      />
    );

    expect(screen.getByText("Reviewed Résumé Plain Text")).toBeInTheDocument();
    expect(screen.getByText(/8 words/i)).toBeInTheDocument();
    expect(screen.getByTestId("reviewed-text-preview")).toHaveTextContent(
      "Experienced software engineer with 5 years in TypeScript."
    );

    await user.click(screen.getByRole("button", { name: /Edit Text/i }));
    const textarea = screen.getByLabelText(/Reviewed résumé plain text/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("Experienced software engineer with 5 years in TypeScript.");
  });

  it("allows editing text and saving changes", async () => {
    const user = userEvent.setup();
    render(
      <ResumeReviewEditor
        reviewedText="Initial text."
        onSaveText={mockOnSave}
      />
    );

    await user.click(screen.getByRole("button", { name: /Edit Text/i }));
    const textarea = screen.getByLabelText(/Reviewed résumé plain text/i);

    await user.clear(textarea);
    await user.type(textarea, "Revised résumé text.");
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(mockOnSave).toHaveBeenCalledWith("Revised résumé text.");
  });
});

describe("ResumeAiConsentToggle component", () => {
  const mockOnToggle = jest.fn();

  it("renders checkbox matching enabled state and triggers onToggle", async () => {
    const user = userEvent.setup();
    render(<ResumeAiConsentToggle enabled={false} onToggle={mockOnToggle} />);

    const checkbox = screen.getByRole("checkbox", { name: /Include résumé in AI analysis/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });
});

describe("ResumeExtractionAlert component", () => {
  const mockOnRetry = jest.fn();
  const mockOnManual = jest.fn();

  it("renders failure guidance and retry button", async () => {
    const user = userEvent.setup();
    render(<ResumeExtractionAlert onRetry={mockOnRetry} onManualEntry={mockOnManual} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/OCR is not supported in the MVP/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Retry Extraction/i }));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Enter Text Manually/i }));
    expect(mockOnManual).toHaveBeenCalledTimes(1);
  });
});

describe("ResumeDeleteDialog component", () => {
  const mockOnConfirm = jest.fn();
  const mockOnOpenChange = jest.fn();

  it("displays confirmation modal with filename", () => {
    render(
      <ResumeDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirmDelete={mockOnConfirm}
        fileName="Jane_Resume.pdf"
      />
    );

    expect(screen.getByText(/Delete uploaded résumé\?/i)).toBeInTheDocument();
    expect(screen.getByText("Jane_Resume.pdf")).toBeInTheDocument();
  });
});

describe("ResumeReplaceDialog component", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnReplaced = jest.fn();

  it("displays replacement confirmation modal with guidance", () => {
    render(
      <ResumeReplaceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onReplaced={mockOnReplaced}
        opportunityId="opp-1"
      />
    );

    expect(screen.getByText(/Replace existing résumé\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Uploading a new résumé will permanently delete the current file/i)
    ).toBeInTheDocument();
  });
});

