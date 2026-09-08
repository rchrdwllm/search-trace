/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("type-safe API migration inventory", () => {
  it("keeps provider routes separate and removes application auth Server Actions", () => {
    expect(fs.existsSync(path.join(root, "app/(auth)/actions.ts"))).toBe(false);
    expect(read("app/api/auth/[...all]/route.ts")).toContain("toNextJsHandler");
    expect(read("specs/004-type-safe-api-migration/contracts/migration-inventory.md")).toContain("Migrated");
  });

  it("keeps browser forms away from server-only database and auth modules", () => {
    for (const file of ["components/auth/sign-in-form.tsx", "components/auth/sign-up-form.tsx", "components/auth/sign-out-button.tsx"]) {
      const source = read(file);
      expect(source).not.toMatch(/@\/lib\/(db|auth)(["'])/);
      expect(source).not.toContain("useActionState");
    }
  });
});
