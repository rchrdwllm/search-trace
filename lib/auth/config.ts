import "server-only";
import { z } from "zod";

const authEnvironmentSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

export function getAuthEnvironment(env: NodeJS.ProcessEnv = process.env) {
  return authEnvironmentSchema.parse({
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
  });
}

export function getTrustedOrigins(baseUrl: string) {
  return [new URL(baseUrl).origin];
}
