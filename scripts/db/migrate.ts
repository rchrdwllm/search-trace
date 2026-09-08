import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { getDatabaseConfig } from "../../lib/db/config";

const { connectionString } = getDatabaseConfig();
const client = postgres(connectionString);
try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
} finally {
  await client.end({ timeout: 5 });
}
