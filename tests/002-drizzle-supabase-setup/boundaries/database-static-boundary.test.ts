import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("database source boundaries", () => {
  it("keeps DATABASE_URL and lib/db out of browser-reachable source", () => {
    const files = ["app/page.tsx", "app/layout.tsx", "lib/supabase/client.ts", "lib/supabase/server.ts"];
    for (const file of files) {
      const source = read(file);
      expect(source).not.toMatch(/DATABASE_URL|@\/lib\/db|\.\.\/db/);
    }
  });
});
