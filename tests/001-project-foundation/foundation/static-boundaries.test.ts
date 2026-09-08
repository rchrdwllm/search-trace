import fs from "node:fs";
import path from "node:path";

const componentsDirectory = path.join(process.cwd(), "components");
const sourceFiles = fs.readdirSync(componentsDirectory).filter((file) => file.endsWith(".tsx"));

describe("source safety boundaries", () => {
  it("contains no known unreviewed registry defects in retained block files", () => {
    for (const file of sourceFiles) {
      const source = fs.readFileSync(path.join(componentsDirectory, file), "utf8");
      expect(source).not.toMatch(/IconPlaceholder|pxx-4|@\/components\/[0-9]+/);
      expect(source).not.toMatch(/https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
    }
  });

  it("contains no privileged environment variable reference in browser-reachable source", () => {
    const files = [
      ...sourceFiles.map((file) => path.join(componentsDirectory, file)),
      path.join(process.cwd(), "app", "page.tsx"),
      path.join(process.cwd(), "app", "layout.tsx"),
      path.join(process.cwd(), "lib", "supabase", "client.ts"),
    ];
    for (const file of files) {
      expect(fs.readFileSync(file, "utf8")).not.toMatch(/SECRET|SERVICE_ROLE/i);
    }
  });
});
