import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

/* ───────────────────────── Better Auth tables (migration M5) ─────────────────────────
 * Owned by Better Auth (drizzle adapter). Identity system of record: `user.id` is a
 * string (UUID). Feature tables migrate their userId columns to varchar(36) in M5.2.
 */
export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // Authorization role (Better Auth additionalField) — preserves admin tier.
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AuthUser = typeof user.$inferSelect;

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 }).notNull(),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// (Migration M5.2) The Manus `users` table was removed — Better Auth's `user`
// table (above) is now the identity system of record. Feature tables key
// `userId` as varchar(36) referencing `user.id`.

/**
 * Brew journal entries table
 * Stores user's brewing experiments with photos and detailed parameters
 */
export const brewEntries = mysqlTable("brew_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
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
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  
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
  userId: varchar("user_id", { length: 36 }).notNull(),
  
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
    userId: varchar("user_id", { length: 36 }).notNull(),
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