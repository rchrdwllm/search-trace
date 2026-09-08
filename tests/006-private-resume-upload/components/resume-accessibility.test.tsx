import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { ResumeUploadDropzone } from "@/components/resumes/resume-upload-dropzone";
import { ResumeCard } from "@/components/resumes/resume-card";
import { ResumeReviewEditor } from "@/components/resumes/resume-review-editor";
import { ResumeAiConsentToggle } from "@/components/resumes/resume-ai-consent-toggle";
import { ResumeExtractionAlert } from "@/components/resumes/resume-extraction-alert";
import { ResumeDeleteDialog } from "@/components/resumes/resume-delete-dialog";
import { ResumeReplaceDialog } from "@/components/resumes/resume-replace-dialog";

describe("Resume UI accessibility (axe)", () => {
  it("ResumeUploadDropzone has zero axe violations", async () => {
    const { container } = render(
      <main id="main-content">
        <h2>Résumé Upload</h2>
        <ResumeUploadDropzone opportunityId="opp-1" />
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ResumeCard has zero axe violations", async () => {
    const { container } = render(
      <main id="main-content">
        <h2>Uploaded Résumé</h2>
        <ResumeCard
          fileName="Jane_Doe_Resume.pdf"
          fileSize={245100}
          fileType="application/pdf"
          extractionState="ready"
          createdAt={new Date("2026-09-08T12:00:00Z")}
          onDownload={jest.fn()}
          onReplace={jest.fn()}
          onDelete={jest.fn()}
        />
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ResumeReviewEditor has zero axe violations in preview mode", async () => {
    const { container } = render(
      <main id="main-content">
        <ResumeReviewEditor
          reviewedText="Experienced software engineer with 5 years in TypeScript."
          onSaveText={jest.fn()}
        />
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ResumeAiConsentToggle has zero axe violations", async () => {
    const { container } = render(
      <main id="main-content">
        <ResumeAiConsentToggle enabled={false} onToggle={jest.fn()} />
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ResumeExtractionAlert has zero axe violations", async () => {
    const { container } = render(
      <main id="main-content">
        <ResumeExtractionAlert onRetry={jest.fn()} onManualEntry={jest.fn()} />
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ResumeDeleteDialog has zero axe violations when open", async () => {
    const { baseElement } = render(
      <ResumeDeleteDialog
        open={true}
        onOpenChange={jest.fn()}
        onConfirmDelete={jest.fn()}
        fileName="Jane_Resume.pdf"
      />
    );

    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  it("ResumeReplaceDialog has zero axe violations when open", async () => {
    const { baseElement } = render(
      <ResumeReplaceDialog
        open={true}
        onOpenChange={jest.fn()}
        onReplaced={jest.fn()}
        opportunityId="opp-1"
      />
    );

    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });
});
