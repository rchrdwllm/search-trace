/** @jest-environment node */
import postgres from "postgres";
import { createDatabaseClient } from "@/lib/db";

jest.mock("postgres", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("drizzle-orm/postgres-js", () => ({ drizzle: jest.fn((client: unknown) => ({ client })) }));

describe("server database factory", () => {
  const mockedPostgres = postgres as unknown as jest.Mock;
  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://user:password@example.com/searchtrace";
    mockedPostgres.mockReturnValue({ end: jest.fn().mockResolvedValue(undefined) });
  });
  afterEach(() => { delete process.env.DATABASE_URL; jest.clearAllMocks(); });

  it("constructs lazily when requested and exposes close", async () => {
    expect(mockedPostgres).not.toHaveBeenCalled();
    const client = createDatabaseClient();
    expect(mockedPostgres).toHaveBeenCalledWith(process.env.DATABASE_URL);
    await client.close();
  });
});
