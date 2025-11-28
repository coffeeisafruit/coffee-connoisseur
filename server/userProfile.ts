import { eq } from "drizzle-orm";
import { userProfiles, InsertUserProfile } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getUserProfile(profile.userId);

  if (existing) {
    // Update existing profile
    await db
      .update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, profile.userId));
    
    return existing.id;
  } else {
    // Create new profile
    const result = await db.insert(userProfiles).values(profile);
    return result[0].insertId;
  }
}
