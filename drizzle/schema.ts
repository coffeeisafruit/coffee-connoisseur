import { int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Brew journal entries table
 * Stores user's brewing experiments with photos and detailed parameters
 */
export const brewEntries = mysqlTable("brew_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  
  // Bean information
  beanName: varchar("bean_name", { length: 255 }).notNull(),
  origin: varchar("origin", { length: 255 }).notNull(),
  roastLevel: mysqlEnum("roast_level", ["light", "medium", "medium_dark", "dark"]).notNull(),
  grindSize: mysqlEnum("grind_size", ["extra_fine", "fine", "medium", "coarse"]).notNull(),
  
  // Brewing parameters
  brewMethod: mysqlEnum("brew_method", ["pour_over", "french_press", "aeropress", "espresso", "drip", "cold_brew"]).notNull(),
  waterTemp: varchar("water_temp", { length: 50 }),
  brewTime: varchar("brew_time", { length: 50 }),
  coffeeAmount: varchar("coffee_amount", { length: 50 }),
  waterAmount: varchar("water_amount", { length: 50 }),
  
  // Rating and notes
  rating: int("rating").notNull().default(0),
  tastingNotes: text("tasting_notes"),
  observations: text("observations"),
  
  // Photo storage
  photoUrl: text("photo_url"),
  photoKey: text("photo_key"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BrewEntry = typeof brewEntries.$inferSelect;
export type InsertBrewEntry = typeof brewEntries.$inferInsert;

/**
 * User coffee profiles table
 * Stores quiz results and personalized coffee preferences
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  
  // Quiz answers
  flavorPreference: varchar("flavor_preference", { length: 100 }),
  roastPreference: varchar("roast_preference", { length: 100 }),
  tasteSensitivity: varchar("taste_sensitivity", { length: 100 }),
  acidityPreference: varchar("acidity_preference", { length: 100 }),
  brewingMethod: varchar("brewing_method", { length: 100 }),
  originInterest: varchar("origin_interest", { length: 100 }),
  sweetnessLevel: varchar("sweetness_level", { length: 100 }),
  bodyPreference: varchar("body_preference", { length: 100 }),
  
  // Generated profile
  profileType: varchar("profile_type", { length: 255 }),
  profileDescription: text("profile_description"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Coffee roasters table
 * Stores information about local coffee roasters
 */
export const roasters = mysqlTable("roasters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }),
  
  // Location coordinates
  latitude: varchar("latitude", { length: 50 }).notNull(),
  longitude: varchar("longitude", { length: 50 }).notNull(),
  
  // Contact information
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  
  // Roaster details
  beanOrigins: text("bean_origins"), // JSON array of origins
  roastStyles: text("roast_styles"), // JSON array of styles
  specialties: text("specialties"), // JSON array of specialties
  
  // Business hours
  hours: text("hours"), // JSON object with hours
  
  // Images
  logoUrl: text("logo_url"),
  photoUrl: text("photo_url"),
  
  // Ratings
  averageRating: int("average_rating").default(0),
  reviewCount: int("review_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Roaster = typeof roasters.$inferSelect;
export type InsertRoaster = typeof roasters.$inferInsert;

/**
 * Roaster reviews table
 * Stores user reviews for coffee roasters
 */
export const roasterReviews = mysqlTable("roaster_reviews", {
  id: int("id").autoincrement().primaryKey(),
  roasterId: int("roaster_id").notNull(),
  userId: int("user_id").notNull(),
  
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  review: text("review"),
  
  // Review details
  beansPurchased: varchar("beans_purchased", { length: 255 }),
  visitDate: timestamp("visit_date"),
  
  // Helpful votes
  helpfulCount: int("helpful_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RoasterReview = typeof roasterReviews.$inferSelect;
export type InsertRoasterReview = typeof roasterReviews.$inferInsert;

/**
 * Roaster review "helpful" votes (Story 3.1 / FR-15).
 * One vote per (review, user) — enforced by the unique constraint — so
 * `roaster_reviews.helpful_count` can be trusted (no double-counting).
 */
export const reviewHelpfulVotes = mysqlTable(
  "review_helpful_votes",
  {
    id: int("id").autoincrement().primaryKey(),
    reviewId: int("review_id").notNull(),
    userId: int("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    // App-enforced FK convention (consistent with existing tables); the unique
    // pair is the integrity guarantee FR-15 depends on.
    uniqueVote: unique("uniq_review_user").on(table.reviewId, table.userId),
  })
);

export type ReviewHelpfulVote = typeof reviewHelpfulVotes.$inferSelect;
export type InsertReviewHelpfulVote = typeof reviewHelpfulVotes.$inferInsert;