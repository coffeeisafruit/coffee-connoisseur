import { beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "./server/db";

/**
 * Per-test DB isolation (retro follow-up).
 *
 * The server tests are integration-style against a shared MySQL. Truncating
 * every table before each test gives each test a clean slate, so the suite is
 * re-runnable without a manual `DROP DATABASE` between runs. (Combined with
 * `fileParallelism:false` in vitest.config.ts, which prevents cross-file races
 * since all files share one database.)
 *
 * No-op when there is no DB (so non-DB environments don't crash at import).
 */
const TABLES = [
  "review_helpful_votes",
  "roaster_reviews",
  "roasters",
  "user_profiles",
  "brew_entries",
  // Better Auth identity tables (migration M5.2)
  "session",
  "account",
  "verification",
  "user",
];

beforeEach(async () => {
  const db = await getDb();
  if (!db) return;
  for (const table of TABLES) {
    await db.execute(sql.raw(`TRUNCATE TABLE \`${table}\``));
  }
});
