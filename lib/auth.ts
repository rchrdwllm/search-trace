import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createDatabaseClient } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { getAuthEnvironment, getTrustedOrigins } from "@/lib/auth/config";

const database = createDatabaseClient();
const environment = getAuthEnvironment();
export const auth = betterAuth({
  appName: "SearchTrace", baseURL: environment.BETTER_AUTH_URL, secret: environment.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(environment.BETTER_AUTH_URL),
  database: drizzleAdapter(database.db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  user: { modelName: "user" }, session: { modelName: "session", storeSessionInDatabase: true },
  account: { modelName: "account" }, verification: { modelName: "verification" }, plugins: [nextCookies()],
});
