import { eq, and, like, sql } from "drizzle-orm";
import { roasters, roasterReviews, reviewHelpfulVotes, InsertRoaster, InsertRoasterReview } from "../drizzle/schema";
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
 * Mark a review helpful (Story 3.1 / FR-15).
 * Idempotent per (review, user): records the vote and increments
 * `roaster_reviews.helpful_count` only on the user's FIRST vote.
 * Returns whether the count changed and the resulting count.
 */
export async function markReviewHelpful(reviewId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const helpfulCountFor = async (): Promise<number> => {
    const r = await db
      .select()
      .from(roasterReviews)
      .where(eq(roasterReviews.id, reviewId))
      .limit(1);
    return r[0]?.helpfulCount ?? 0;
  };

  // Validate the review exists (no DB FKs — app-enforced). Prevents orphan votes
  // and misleading {counted:true} responses for non-existent reviews.
  const review = await db
    .select()
    .from(roasterReviews)
    .where(eq(roasterReviews.id, reviewId))
    .limit(1);
  if (review.length === 0) {
    throw new Error("Review not found");
  }

  // Already voted? -> no-op (don't double count).
  const existing = await db
    .select()
    .from(reviewHelpfulVotes)
    .where(and(eq(reviewHelpfulVotes.reviewId, reviewId), eq(reviewHelpfulVotes.userId, userId)))
    .limit(1);
  if (existing.length > 0) {
    return { counted: false, helpfulCount: review[0].helpfulCount ?? 0 };
  }

  // Insert the vote. A concurrent first-vote from the same user trips the unique
  // (reviewId,userId) constraint — catch it and treat as already-voted so the
  // race resolves idempotently instead of surfacing a 500.
  try {
    await db.insert(reviewHelpfulVotes).values({ reviewId, userId });
  } catch {
    return { counted: false, helpfulCount: await helpfulCountFor() };
  }

  await db
    .update(roasterReviews)
    .set({ helpfulCount: sql`${roasterReviews.helpfulCount} + 1` })
    .where(eq(roasterReviews.id, reviewId));

  return { counted: true, helpfulCount: await helpfulCountFor() };
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
