import fs from "node:fs";
import path from "node:path";

describe("verification contract", () => {
  it("defines the required offline scripts in order", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    expect(packageJson.scripts.typecheck).toBe("tsc --noEmit");
    expect(packageJson.scripts.test).toContain("jest");
    expect(packageJson.scripts["test:coverage"]).toContain("--coverage");
    expect(packageJson.scripts.check).toBe("bun run lint && bun run typecheck && bun run test");
  });
});
