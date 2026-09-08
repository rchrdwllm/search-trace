import { DatabaseConfigurationError, validateDatabaseConfig } from "@/lib/db/config";

describe("database configuration", () => {
  it.each([undefined, "", "   "]) ("rejects blank values", (databaseUrl) => {
    expect(() => validateDatabaseConfig({ databaseUrl })).toThrow(DatabaseConfigurationError);
  });

  it.each(["https://example.com/db", "mysql://user:pass@host/db", "postgres://missing-host"]) (
    "rejects malformed or non-PostgreSQL URLs: %s",
    (databaseUrl) => {
      expect(() => validateDatabaseConfig({ databaseUrl })).toThrow(DatabaseConfigurationError);
    },
  );

  it("accepts a complete PostgreSQL URL", () => {
    const result = validateDatabaseConfig({
      databaseUrl: "postgresql://user:password@example.com:5432/searchtrace",
    });
    expect(result.connectionString).toContain("postgresql://");
  });

  it("does not expose candidate values in errors", () => {
    const candidate = "postgresql://secret-user:secret-password@db.example.com/searchtrace";
    try {
      validateDatabaseConfig({ databaseUrl: "not-a-url" });
    } catch (error) {
      expect(String(error)).not.toContain(candidate);
      expect(String(error)).not.toContain("secret-password");
    }
  });
});
