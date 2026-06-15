// Better Auth (migration M5) — self-hosted email/password auth, Drizzle adapter.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification } from "../../drizzle/schema";
import { createDrizzle } from "../db";
import { ENV } from "./env";

// Dedicated drizzle instance for Better Auth (SSL-aware via createDrizzle).
// mysql2 pools are lazy, so this is safe at import even without DATABASE_URL.
const authDb = createDrizzle(ENV.databaseUrl || "mysql://invalid:invalid@127.0.0.1:3306/none");

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "mysql",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // Email verification stubbed for this cycle (see PRD §4.1 Out of Scope).
  },
  user: {
    additionalFields: {
      // Authorization tier (preserves the admin procedure). Not user-settable.
      role: { type: "string", required: false, defaultValue: "user", input: false },
    },
  },
  secret: ENV.betterAuthSecret,
  baseURL: ENV.betterAuthUrl,
});

export type Auth = typeof auth;
