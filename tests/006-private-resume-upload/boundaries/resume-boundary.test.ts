/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

describe("resume module boundaries", () => {
  it("enforces server-only import in resume backend modules", () => {
    const serverFiles = [
      "trpc/routers/resume.ts",
      "lib/storage/resume.ts",
      "lib/extraction/magic-bytes.ts",
      "lib/extraction/parser.ts",
    ];

    for (const file of serverFiles) {
      const source = read(file);
      expect(source).toContain('import "server-only";');
    }
  });

  it("keeps server-only tokens out of resume client components and schemas", () => {
    const clientFiles = [
      "components/resumes/resume-upload-dropzone.tsx",
      "components/resumes/resume-card.tsx",
      "components/resumes/resume-review-editor.tsx",
      "components/resumes/resume-ai-consent-toggle.tsx",
      "components/resumes/resume-extraction-alert.tsx",
      "components/resumes/resume-delete-dialog.tsx",
      "components/resumes/resume-replace-dialog.tsx",
      "components/resumes/resume-section.tsx",
      "lib/validations/resume.ts",
    ];

    const forbiddenPatterns = [
      /import\s+["']server-only["']/,
      /from\s+["']@\/lib\/db["']/,
      /from\s+["']@\/lib\/storage\/resume["']/,
      /from\s+["']postgres["']/,
      /from\s+["']drizzle-orm\/postgres-js["']/,
      /\bprocess\.env\.DATABASE_URL\b/,
      /\bprocess\.env\.BETTER_AUTH_SECRET\b/,
    ];

    for (const file of clientFiles) {
      const source = read(file);
      for (const pattern of forbiddenPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("ensures shared validation schema is free of database and server dependencies", () => {
    const validationSource = read("lib/validations/resume.ts");
    expect(validationSource).not.toContain("drizzle");
    expect(validationSource).not.toContain("postgres");
    expect(validationSource).not.toContain("DATABASE_URL");
    expect(validationSource).not.toContain("server-only");
  });
});
