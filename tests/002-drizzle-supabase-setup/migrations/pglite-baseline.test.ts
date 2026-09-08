/** @jest-environment node */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "node:path";

describe("offline migration baseline", () => {
  it("applies the committed baseline twice", async () => {
    const client = new PGlite();
    const db = drizzle(client);
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    await migrate(db, { migrationsFolder });
    const result = await client.query<{ count: string }>(
      'select count(*)::text as count from "drizzle"."__drizzle_migrations"',
    );
    expect(Number(result.rows[0]?.count)).toBe(2);
    await client.close();
  });
});
