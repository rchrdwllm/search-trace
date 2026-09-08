/** @jest-environment node */
import { getTableColumns } from "drizzle-orm";
import { opportunities, schema, user } from "@/lib/db/schema";

describe("opportunities schema definition", () => {
  it("includes opportunities in the exported canonical schema", () => {
    expect(schema.opportunities).toBeDefined();
    expect(schema.opportunities).toBe(opportunities);
  });

  it("defines all required columns with expected constraints", () => {
    const columns = getTableColumns(opportunities);

    expect(columns.id).toBeDefined();
    expect(columns.id.primary).toBe(true);

    expect(columns.userId).toBeDefined();
    expect(columns.userId.notNull).toBe(true);

    expect(columns.company).toBeDefined();
    expect(columns.company.notNull).toBe(true);

    expect(columns.role).toBeDefined();
    expect(columns.role.notNull).toBe(true);

    expect(columns.jobDescription).toBeDefined();
    expect(columns.jobDescription.notNull).toBe(true);

    expect(columns.sourceUrl).toBeDefined();
    expect(columns.sourceUrl.notNull).toBe(false);

    expect(columns.status).toBeDefined();
    expect(columns.status.notNull).toBe(true);
    expect(columns.status.default).toBe("draft");

    expect(columns.createdAt).toBeDefined();
    expect(columns.createdAt.notNull).toBe(true);

    expect(columns.updatedAt).toBeDefined();
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it("configures foreign key to user table with cascading deletion", () => {
    const fks = (opportunities as unknown as { [key: symbol]: Array<{
      onDelete?: string;
      reference: () => { foreignTable: unknown };
    }> })[
      Symbol.for("drizzle:PgInlineForeignKeys")
    ] ?? [];

    expect(fks.length).toBeGreaterThan(0);
    expect(fks[0].onDelete).toBe("cascade");
    expect(fks[0].reference().foreignTable).toBe(user);
  });
});
