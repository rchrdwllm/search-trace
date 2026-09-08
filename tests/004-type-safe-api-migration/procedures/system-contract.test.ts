/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

describe("system router contract", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "trpc/routers/system.ts"), "utf8");
  it("provides typed public and protected representative procedures", () => {
    expect(source).toContain("health: publicProcedure");
    expect(source).toContain("session: protectedProcedure");
    expect(source).toContain("userId: ctx.actorId");
  });
});
