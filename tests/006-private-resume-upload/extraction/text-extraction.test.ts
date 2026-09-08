/** @jest-environment node */
import {
  detectFileType,
  isDocxBuffer,
  isPdfBuffer,
  validateResumeBuffer,
} from "@/lib/extraction/magic-bytes";
import {
  ExtractionError,
  extractResumeText,
} from "@/lib/extraction/parser";

describe("magic bytes signature inspection", () => {
  const pdfHeader = Buffer.from("%PDF-1.4\n%âãÏÓ\n");
  const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
  const exeHeader = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  it("accurately identifies PDF signatures", () => {
    expect(isPdfBuffer(pdfHeader)).toBe(true);
    expect(isDocxBuffer(pdfHeader)).toBe(false);
    expect(detectFileType(pdfHeader)).toBe("pdf");
  });

  it("accurately identifies DOCX ZIP signatures", () => {
    expect(isDocxBuffer(docxHeader)).toBe(true);
    expect(isPdfBuffer(docxHeader)).toBe(false);
    expect(detectFileType(docxHeader)).toBe("docx");
  });

  it("rejects non-document signatures such as executables and images", () => {
    expect(detectFileType(exeHeader)).toBeNull();
    expect(detectFileType(pngHeader)).toBeNull();
    expect(detectFileType(Buffer.from("Hello world plain text"))).toBeNull();
    expect(detectFileType(Buffer.alloc(0))).toBeNull();
  });

  it("validates valid PDF buffer with matching extension", () => {
    const result = validateResumeBuffer(pdfHeader, {
      fileName: "resume.pdf",
      declaredMimeType: "application/pdf",
    });
    expect(result.valid).toBe(true);
    expect(result.detectedType).toBe("pdf");
  });

  it("validates valid DOCX buffer with matching extension", () => {
    const result = validateResumeBuffer(docxHeader, {
      fileName: "resume.docx",
      declaredMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    expect(result.valid).toBe(true);
    expect(result.detectedType).toBe("docx");
  });

  it("rejects when file extension does not match detected signature", () => {
    const result = validateResumeBuffer(pdfHeader, {
      fileName: "disguised.docx",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/extension does not match/i);
  });

  it("rejects when declared MIME type contradicts detected signature", () => {
    const result = validateResumeBuffer(pdfHeader, {
      declaredMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/MIME type/i);
  });

  it("rejects empty or corrupt buffer", () => {
    const empty = validateResumeBuffer(Buffer.alloc(0));
    expect(empty.valid).toBe(false);
    expect(empty.error).toMatch(/empty/i);
  });
});

describe("text extraction service", () => {
  it("rejects corrupt PDF buffer with ExtractionError", async () => {
    const corruptPdf = Buffer.from("%PDF-1.4 corrupt data stream without catalog");
    await expect(extractResumeText(corruptPdf, "pdf")).rejects.toThrow(ExtractionError);
  });

  it("rejects corrupt DOCX buffer with ExtractionError", async () => {
    const corruptDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    await expect(extractResumeText(corruptDocx, "docx")).rejects.toThrow(ExtractionError);
  });
});
