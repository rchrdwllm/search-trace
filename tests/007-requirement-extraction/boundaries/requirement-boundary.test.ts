/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

describe("requirement module boundaries", () => {
  it("enforces server-only import in requirement backend modules", () => {
    const serverFiles = [
      "trpc/routers/requirement.ts",
      "lib/ai/gemini.ts",
      "lib/ai/mock.ts",
      "lib/ai/rate-limiter.ts",
      "lib/ai/types.ts",
      "lib/ai/index.ts",
      "lib/extraction/citation-verifier.ts",
    ];

    for (const file of serverFiles) {
      const source = read(file);
      expect(source).toContain('import "server-only";');
    }
  });

  it("keeps server-only tokens and API keys out of requirement client components and schemas", () => {
    const clientFiles = [
      "components/requirements/requirement-section.tsx",
      "components/requirements/requirement-card.tsx",
      "components/requirements/requirement-draft-banner.tsx",
      "components/requirements/requirement-empty-state.tsx",
      "components/requirements/requirement-quota-alert.tsx",
      "components/requirements/requirement-edit-dialog.tsx",
      "components/requirements/requirement-add-dialog.tsx",
      "components/requirements/requirement-reextract-dialog.tsx",
      "lib/validations/requirement.ts",
    ];

    const forbiddenPatterns = [
      /import\s+["']server-only["']/,
      /from\s+["']@\/lib\/db["']/,
      /from\s+["']@\/lib\/ai["']/,
      /from\s+["']postgres["']/,
      /from\s+["']drizzle-orm\/postgres-js["']/,
      /\bprocess\.env\.DATABASE_URL\b/,
      /\bprocess\.env\.GOOGLE_GENERATIVE_AI_API_KEY\b/,
      /\bprocess\.env\.GEMINI_API_KEY\b/,
    ];

    for (const file of clientFiles) {
      const source = read(file);
      for (const pattern of forbiddenPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("ensures shared validation schema is free of database and server dependencies", () => {
    const validationSource = read("lib/validations/requirement.ts");
    expect(validationSource).not.toContain("drizzle");
    expect(validationSource).not.toContain("postgres");
    expect(validationSource).not.toContain("DATABASE_URL");
    expect(validationSource).not.toContain("server-only");
  });
});
