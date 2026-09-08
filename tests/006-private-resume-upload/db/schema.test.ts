/** @jest-environment node */
import { getTableColumns } from "drizzle-orm";
import { opportunities, resumes, schema, user } from "@/lib/db/schema";

describe("resumes schema definition", () => {
  it("includes resumes in the exported canonical schema", () => {
    expect(schema.resumes).toBeDefined();
    expect(schema.resumes).toBe(resumes);
  });

  it("defines all required columns with expected constraints", () => {
    const columns = getTableColumns(resumes);

    expect(columns.id).toBeDefined();
    expect(columns.id.primary).toBe(true);

    expect(columns.opportunityId).toBeDefined();
    expect(columns.opportunityId.notNull).toBe(true);
    expect(columns.opportunityId.isUnique).toBe(true);

    expect(columns.userId).toBeDefined();
    expect(columns.userId.notNull).toBe(true);

    expect(columns.fileName).toBeDefined();
    expect(columns.fileName.notNull).toBe(true);

    expect(columns.fileSize).toBeDefined();
    expect(columns.fileSize.notNull).toBe(true);

    expect(columns.fileType).toBeDefined();
    expect(columns.fileType.notNull).toBe(true);

    expect(columns.storagePath).toBeDefined();
    expect(columns.storagePath.notNull).toBe(true);

    expect(columns.extractionState).toBeDefined();
    expect(columns.extractionState.notNull).toBe(true);
    expect(columns.extractionState.default).toBe("pending");

    expect(columns.extractedText).toBeDefined();
    expect(columns.extractedText.notNull).toBe(false);

    expect(columns.reviewedText).toBeDefined();
    expect(columns.reviewedText.notNull).toBe(false);

    expect(columns.aiOptIn).toBeDefined();
    expect(columns.aiOptIn.notNull).toBe(true);
    expect(columns.aiOptIn.default).toBe(false);

    expect(columns.createdAt).toBeDefined();
    expect(columns.createdAt.notNull).toBe(true);

    expect(columns.updatedAt).toBeDefined();
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it("configures foreign keys to opportunities and user tables with cascading deletion", () => {
    const fks = (resumes as unknown as { [key: symbol]: Array<{
      onDelete?: string;
      reference: () => { foreignTable: unknown };
    }> })[
      Symbol.for("drizzle:PgInlineForeignKeys")
    ] ?? [];

    expect(fks.length).toBeGreaterThanOrEqual(2);

    const opportunityFk = fks.find((fk) => fk.reference().foreignTable === opportunities);
    const userFk = fks.find((fk) => fk.reference().foreignTable === user);

    expect(opportunityFk).toBeDefined();
    expect(opportunityFk?.onDelete).toBe("cascade");

    expect(userFk).toBeDefined();
    expect(userFk?.onDelete).toBe("cascade");
  });
});
