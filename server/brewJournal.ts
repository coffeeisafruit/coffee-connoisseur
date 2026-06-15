import { eq, desc, and } from "drizzle-orm";
import { brewEntries, InsertBrewEntry } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all brew entries for a specific user
 */
export async function getUserBrewEntries(userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(brewEntries)
    .where(eq(brewEntries.userId, userId))
    .orderBy(desc(brewEntries.date));
}

/**
 * Get a single brew entry by ID (with user ownership check)
 */
export async function getBrewEntryById(entryId: number, userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(brewEntries)
    .where(and(eq(brewEntries.id, entryId), eq(brewEntries.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Create a new brew entry
 */
export async function createBrewEntry(entry: InsertBrewEntry) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(brewEntries).values(entry);
  return result[0].insertId;
}

/**
 * Update an existing brew entry
 */
export async function updateBrewEntry(
  entryId: number,
  userId: string,
  updates: Partial<InsertBrewEntry>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(brewEntries)
    .set(updates)
    .where(and(eq(brewEntries.id, entryId), eq(brewEntries.userId, userId)));

  return true;
}

/**
 * Delete a brew entry
 */
export async function deleteBrewEntry(entryId: number, userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(brewEntries)
    .where(and(eq(brewEntries.id, entryId), eq(brewEntries.userId, userId)));

  return true;
}

/**
 * Get brew entries filtered by brew method
 */
export async function getBrewEntriesByMethod(userId: string, brewMethod: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(brewEntries)
    .where(and(eq(brewEntries.userId, userId), eq(brewEntries.brewMethod, brewMethod as any)))
    .orderBy(desc(brewEntries.date));
}
