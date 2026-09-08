export type DatabaseConfig = Readonly<{ connectionString: string }>;

export class DatabaseConfigurationError extends Error {
  constructor(message = "DATABASE_URL is missing or invalid. Set it in .env.local; see the setup guide.") {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function validateDatabaseConfig(candidate: { databaseUrl?: string }): DatabaseConfig {
  const value = candidate.databaseUrl?.trim();
  if (!value) throw new DatabaseConfigurationError();
  let url: URL;
  try { url = new URL(value); } catch { throw new DatabaseConfigurationError(); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.username || !url.pathname || url.pathname === "/") {
    throw new DatabaseConfigurationError();
  }
  return { connectionString: value };
}

export function getDatabaseConfig(): DatabaseConfig {
  return validateDatabaseConfig({ databaseUrl: process.env.DATABASE_URL });
}
