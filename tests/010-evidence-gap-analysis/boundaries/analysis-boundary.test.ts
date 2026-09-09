/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

describe("analysis module boundaries", () => {
  it("enforces server-only import in analysis backend router and services", () => {
    const serverFiles = [
      "trpc/routers/analysis.ts",
      "lib/ai/types.ts",
      "lib/ai/analyzer.ts",
    ];

    for (const file of serverFiles) {
      if (fs.existsSync(path.join(root, file))) {
        const source = read(file);
        expect(source).toContain('import "server-only";');
      }
    }
  });

  it("keeps server-only tokens and database connections out of analysis client components and schemas", () => {
    const clientFiles = [
      "components/analysis/analysis-section.tsx",
      "components/analysis/analysis-preflight-dialog.tsx",
      "components/analysis/analysis-draft-review.tsx",
      "components/analysis/analysis-coverage-summary.tsx",
      "components/analysis/analysis-next-action-card.tsx",
      "components/analysis/analysis-requirement-item.tsx",
      "lib/validations/analysis.ts",
    ];

    const forbiddenPatterns = [
      /import\s+["']server-only["']/,
      /from\s+["']@\/lib\/db["']/,
      /from\s+["']postgres["']/,
      /from\s+["']drizzle-orm\/postgres-js["']/,
      /\bprocess\.env\.DATABASE_URL\b/,
      /\bprocess\.env\.GOOGLE_GENERATIVE_AI_API_KEY\b/,
      /\bprocess\.env\.GEMINI_API_KEY\b/,
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
    const validationSource = read("lib/validations/analysis.ts");
    expect(validationSource).not.toContain("drizzle");
    expect(validationSource).not.toContain("postgres");
    expect(validationSource).not.toContain("DATABASE_URL");
    expect(validationSource).not.toContain("server-only");
  });

  it("ensures requirements and opportunities schema has analysis columns defined", () => {
    const schemaSource = read("lib/db/schema.ts");
    expect(schemaSource).toContain("coverage_state");
    expect(schemaSource).toContain("citation_source");
    expect(schemaSource).toContain("citation_excerpt");
    expect(schemaSource).toContain("last_analyzed_at");
    expect(schemaSource).toContain("next_action_text");
    expect(schemaSource).toContain("analysis_limitations");
  });
});
