import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";

// DO Managed MySQL requires TLS (connection string carries ?ssl-mode=REQUIRED).
// Local dev (localhost) does not. Enable SSL only when the URL/host calls for it.
function needsSsl(url: string): boolean {
  if (/ssl-mode=required|sslmode=require/i.test(url)) return true;
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  return process.env.NODE_ENV === "production" && !isLocal;
}

function sslOptions(url: string) {
  if (!needsSsl(url)) return undefined;
  // Prefer verifying against the cluster CA (App Platform injects it as
  // ${db.CA_CERT} → DB_CA_CERT). Only fall back to unverified TLS if no CA is
  // available, so transit is still encrypted.
  const ca = process.env.DB_CA_CERT;
  return ca ? { ca } : { rejectUnauthorized: false };
}

export function createDrizzle(url: string) {
  const ssl = sslOptions(url);
  const pool = createPool(ssl ? { uri: url, ssl } : { uri: url });
  return drizzle(pool);
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling/tests can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = createDrizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
