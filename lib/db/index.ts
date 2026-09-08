import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getDatabaseConfig } from "./config";
import * as schema from "./schema";

export function createDatabaseClient() {
  const client = postgres(getDatabaseConfig().connectionString);
  const db = drizzle(client, { schema });

  return { db, close: () => client.end({ timeout: 5 }) };
}
