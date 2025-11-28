import { eq, and, like, sql } from "drizzle-orm";
import { roasters, roasterReviews, InsertRoaster, InsertRoasterReview } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all roasters
 */
export async function getAllRoasters() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(roasters);
}

/**
 * Get roasters filtered by origin
 */
export async function getRoastersByOrigin(origin: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(roasters)
    .where(like(roasters.beanOrigins, `%${origin}%`));
}

/**
 * Get roasters filtered by minimum rating
 */
export async function getRoastersByRating(minRating: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(roasters)
    .where(sql`${roasters.averageRating} >= ${minRating}`);
}

/**
 * Get a single roaster by ID
 */
export async function getRoasterById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(roasters)
    .where(eq(roasters.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Create a new roaster
 */
export async function createRoaster(roaster: InsertRoaster) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(roasters).values(roaster);
  return result[0].insertId;
}

/**
 * Update roaster rating after a review
 */
export async function updateRoasterRating(roasterId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Calculate average rating from reviews
  const reviews = await db
    .select()
    .from(roasterReviews)
    .where(eq(roasterReviews.roasterId, roasterId));

  if (reviews.length === 0) {
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round(totalRating / reviews.length);

  await db
    .update(roasters)
    .set({
      averageRating,
      reviewCount: reviews.length,
    })
    .where(eq(roasters.id, roasterId));
}

/**
 * Get reviews for a roaster
 */
export async function getReviewsByRoaster(roasterId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(roasterReviews)
    .where(eq(roasterReviews.roasterId, roasterId));
}

/**
 * Create a new review
 */
export async function createReview(review: InsertRoasterReview) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(roasterReviews).values(review);
  
  // Update roaster rating
  await updateRoasterRating(review.roasterId);
  
  return result[0].insertId;
}

/**
 * Check if user has already reviewed a roaster
 */
export async function hasUserReviewed(roasterId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(roasterReviews)
    .where(and(
      eq(roasterReviews.roasterId, roasterId),
      eq(roasterReviews.userId, userId)
    ))
    .limit(1);

  return result.length > 0;
}
