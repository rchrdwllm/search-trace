/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

describe("opportunity module boundaries", () => {
  it("enforces server-only import in opportunity router", () => {
    const routerSource = read("trpc/routers/opportunity.ts");
    expect(routerSource).toContain('import "server-only";');
  });

  it("keeps server-only tokens out of client components and browser pages", () => {
    const clientFiles = [
      "components/opportunities/opportunity-form.tsx",
      "components/opportunities/opportunity-card.tsx",
      "components/opportunities/opportunity-status-badge.tsx",
      "components/opportunities/opportunity-delete-dialog.tsx",
      "components/opportunities/opportunity-edit-client.tsx",
      "components/opportunities/opportunity-page-navigation.tsx",
      "components/opportunities/opportunity-next-step.tsx",
      "components/opportunities/opportunity-status-control.tsx",
      "app/(app)/dashboard/opportunities/new/page.tsx",
      "lib/validations/opportunity.ts",
    ];

    const forbiddenPatterns = [
      /import\s+["']server-only["']/,
      /from\s+["']@\/lib\/db["']/,
      /from\s+["']postgres["']/,
      /from\s+["']drizzle-orm\/postgres-js["']/,
      /\bprocess\.env\.DATABASE_URL\b/,
    ];

    for (const file of clientFiles) {
      const source = read(file);
      for (const pattern of forbiddenPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("ensures shared validation schema is free of database dependencies", () => {
    const validationSource = read("lib/validations/opportunity.ts");
    expect(validationSource).not.toContain("drizzle");
    expect(validationSource).not.toContain("postgres");
    expect(validationSource).not.toContain("DATABASE_URL");
  });
});
