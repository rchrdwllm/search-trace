/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

describe("evidence module boundaries", () => {
  it("enforces server-only import in evidence backend router", () => {
    const serverFiles = ["trpc/routers/evidence.ts"];

    for (const file of serverFiles) {
      if (fs.existsSync(path.join(root, file))) {
        const source = read(file);
        expect(source).toContain('import "server-only";');
      }
    }
  });

  it("keeps server-only tokens and database connections out of evidence client components and schemas", () => {
    const clientFiles = [
      "components/evidence/evidence-card.tsx",
      "components/evidence/evidence-form-dialog.tsx",
      "components/evidence/evidence-delete-dialog.tsx",
      "components/evidence/evidence-type-badge.tsx",
      "components/evidence/evidence-empty-state.tsx",
      "components/evidence/evidence-picker-dialog.tsx",
      "components/evidence/opportunity-evidence-section.tsx",
      "lib/validations/evidence.ts",
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
    const validationSource = read("lib/validations/evidence.ts");
    expect(validationSource).not.toContain("drizzle");
    expect(validationSource).not.toContain("postgres");
    expect(validationSource).not.toContain("DATABASE_URL");
    expect(validationSource).not.toContain("server-only");
  });
});
