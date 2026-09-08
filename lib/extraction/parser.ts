import "server-only";

import { extractText } from "unpdf";
import mammoth from "mammoth";

export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractionError";
  }
}

export class EmptyExtractedTextError extends ExtractionError {
  constructor(
    message = "No readable plain text could be extracted from this document. If this is a scanned PDF, note that OCR is not supported in the MVP. Please paste or enter your plain text."
  ) {
    super(message);
    this.name = "EmptyExtractedTextError";
  }
}

export async function extractResumeText(
  buffer: Uint8Array | Buffer,
  fileType: "pdf" | "docx"
): Promise<{ text: string; pageCount?: number }> {
  if (fileType === "pdf") {
    try {
      const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      const result = await extractText(uint8, { mergePages: true });
      const rawText = (result.text ?? "").trim();

      if (!rawText || rawText.length === 0) {
        throw new EmptyExtractedTextError();
      }

      return {
        text: rawText,
        pageCount: result.totalPages,
      };
    } catch (err) {
      if (err instanceof ExtractionError) {
        throw err;
      }
      throw new ExtractionError("Failed to parse PDF document. The file may be corrupted, encrypted, or invalid.");
    }
  }

  if (fileType === "docx") {
    try {
      const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      const rawText = (result.value ?? "").trim();

      if (!rawText || rawText.length === 0) {
        throw new EmptyExtractedTextError(
          "No readable text could be extracted from this Word document. Please ensure it contains plain text content."
        );
      }

      return {
        text: rawText,
      };
    } catch (err) {
      if (err instanceof ExtractionError) {
        throw err;
      }
      throw new ExtractionError("Failed to parse DOCX document. The file may be corrupted, encrypted, or invalid.");
    }
  }

  throw new ExtractionError(`Unsupported document format: ${fileType}`);
}
