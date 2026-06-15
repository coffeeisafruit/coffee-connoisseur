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

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: needsSsl
    ? { url: connectionString, ssl: ca ? { ca } : { rejectUnauthorized: false } }
    : { url: connectionString },
});
