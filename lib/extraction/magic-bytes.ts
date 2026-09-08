import "server-only";

export const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"
export const DOCX_MAGIC_BYTES = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // "PK\x03\x04"

export function isPdfBuffer(buffer: Uint8Array | Buffer): boolean {
  if (!buffer || buffer.length < PDF_MAGIC_BYTES.length) return false;
  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (buffer[i] !== PDF_MAGIC_BYTES[i]) return false;
  }
  return true;
}

export function isDocxBuffer(buffer: Uint8Array | Buffer): boolean {
  if (!buffer || buffer.length < DOCX_MAGIC_BYTES.length) return false;
  for (let i = 0; i < DOCX_MAGIC_BYTES.length; i++) {
    if (buffer[i] !== DOCX_MAGIC_BYTES[i]) return false;
  }
  return true;
}

export function detectFileType(buffer: Uint8Array | Buffer): "pdf" | "docx" | null {
  if (isPdfBuffer(buffer)) return "pdf";
  if (isDocxBuffer(buffer)) return "docx";
  return null;
}

export function validateResumeBuffer(
  buffer: Uint8Array | Buffer,
  options?: { declaredMimeType?: string; fileName?: string }
): { valid: boolean; detectedType: "pdf" | "docx" | null; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, detectedType: null, error: "Uploaded file is empty." };
  }

  const detected = detectFileType(buffer);
  if (!detected) {
    return {
      valid: false,
      detectedType: null,
      error: "File format does not match expected PDF or DOCX document signature.",
    };
  }

  if (options?.declaredMimeType) {
    const mime = options.declaredMimeType.toLowerCase().trim();
    if (detected === "pdf" && mime !== "application/pdf") {
      return {
        valid: false,
        detectedType: detected,
        error: "File header does not match declared MIME type.",
      };
    }
    if (
      detected === "docx" &&
      mime !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      mime !== "application/octet-stream"
    ) {
      return {
        valid: false,
        detectedType: detected,
        error: "File header does not match declared MIME type.",
      };
    }
  }

  if (options?.fileName) {
    const name = options.fileName.toLowerCase().trim();
    if (detected === "pdf" && !name.endsWith(".pdf")) {
      return {
        valid: false,
        detectedType: detected,
        error: "File extension does not match PDF document signature.",
      };
    }
    if (detected === "docx" && !name.endsWith(".docx")) {
      return {
        valid: false,
        detectedType: detected,
        error: "File extension does not match DOCX document signature.",
      };
    }
  }

  return { valid: true, detectedType: detected };
}
