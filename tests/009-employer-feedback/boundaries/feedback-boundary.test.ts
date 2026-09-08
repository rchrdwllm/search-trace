/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

describe("feedback module boundaries", () => {
  it("enforces server-only import in feedback backend router", () => {
    const serverFiles = ["trpc/routers/feedback.ts"];

    for (const file of serverFiles) {
      if (fs.existsSync(path.join(root, file))) {
        const source = read(file);
        expect(source).toContain('import "server-only";');
      }
    }
  });

  it("keeps server-only tokens and database connections out of feedback client components and schemas", () => {
    const clientFiles = [
      "components/feedback/feedback-card.tsx",
      "components/feedback/feedback-form-dialog.tsx",
      "components/feedback/feedback-delete-dialog.tsx",
      "components/feedback/feedback-source-badge.tsx",
      "components/feedback/feedback-provenance-badge.tsx",
      "components/feedback/feedback-empty-state.tsx",
      "components/feedback/opportunity-feedback-section.tsx",
      "lib/validations/feedback.ts",
    ];

    const forbiddenPatterns = [
      /import\s+["']server-only["']/,
      /from\s+["']@\/lib\/db["']/,
      /from\s+["']postgres["']/,
      /from\s+["']drizzle-orm\/postgres-js["']/,
      /\bprocess\.env\.DATABASE_URL\b/,
    ];

    for (const file of clientFiles) {
      if (fs.existsSync(path.join(root, file))) {
        const source = read(file);
        for (const pattern of forbiddenPatterns) {
          expect(source).not.toMatch(pattern);
        }
      }
    }
  });

  it("ensures shared validation schema is free of database and server dependencies", () => {
    const validationSource = read("lib/validations/feedback.ts");
    expect(validationSource).not.toContain("drizzle");
    expect(validationSource).not.toContain("postgres");
    expect(validationSource).not.toContain("DATABASE_URL");
    expect(validationSource).not.toContain("server-only");
  });
});
