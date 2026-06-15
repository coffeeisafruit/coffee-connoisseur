import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// DO Managed MySQL requires TLS; local dev does not.
const needsSsl =
  /ssl-mode=required|sslmode=require/i.test(connectionString) ||
  (process.env.NODE_ENV === "production" &&
    !/@(localhost|127\.0\.0\.1)[:/]/.test(connectionString));
const ca = process.env.DB_CA_CERT;
if (needsSsl && !ca && process.env.NODE_ENV === "production") {
  throw new Error("DB_CA_CERT is required for TLS migrations against the managed database in production");
}

// Verify against the CA when present; non-prod ad-hoc remote runs may fall back
// to encrypted-but-unverified TLS.
const ssl = needsSsl
  ? ca
    ? { ca, rejectUnauthorized: true }
    : { rejectUnauthorized: false }
  : undefined;

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: ssl ? { url: connectionString, ssl } : { url: connectionString },
});
