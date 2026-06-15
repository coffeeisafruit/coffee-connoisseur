import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as brewJournalDb from "./brewJournal";
import * as userProfileDb from "./userProfile";
import * as roastersDb from "./roasters";
import { storagePut, storageDelete } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Brew Journal router
  brewJournal: router({
    list: protectedProcedure
      .input(z.object({ brewMethod: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.brewMethod && input.brewMethod !== "all") {
          return await brewJournalDb.getBrewEntriesByMethod(ctx.user.id, input.brewMethod);
        }
        return await brewJournalDb.getUserBrewEntries(ctx.user.id);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await brewJournalDb.getBrewEntryById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        beanName: z.string(),
        origin: z.string(),
        roastLevel: z.enum(["light", "medium", "medium_dark", "dark"]),
        grindSize: z.enum(["extra_fine", "fine", "medium", "coarse"]),
        brewMethod: z.enum(["pour_over", "french_press", "aeropress", "espresso", "drip", "cold_brew"]),
        waterTemp: z.string().optional(),
        brewTime: z.string().optional(),
        coffeeAmount: z.string().optional(),
        waterAmount: z.string().optional(),
        rating: z.number().min(0).max(5),
        tastingNotes: z.string().optional(),
        observations: z.string().optional(),
        photoData: z.string().max(15_000_000).optional(), // Base64 image (~11MB cap)
      }))
      .mutation(async ({ ctx, input }) => {
        let photoUrl: string | undefined;
        let photoKey: string | undefined;

        // Upload photo to S3 if provided
        if (input.photoData) {
          const base64Data = input.photoData.split(",")[1] || input.photoData;
          const buffer = Buffer.from(base64Data, "base64");
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(7);
          photoKey = `brew-photos/${ctx.user.id}/${timestamp}-${randomSuffix}.jpg`;
          
          const result = await storagePut(photoKey, buffer, "image/jpeg");
          photoUrl = result.url;
        }

        const { photoData, ...entryData } = input;
        const entryId = await brewJournalDb.createBrewEntry({
          ...entryData,
          userId: ctx.user.id,
          photoUrl,
          photoKey,
        });

        return { id: entryId, photoUrl };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        beanName: z.string().optional(),
        origin: z.string().optional(),
        roastLevel: z.enum(["light", "medium", "medium_dark", "dark"]).optional(),
        grindSize: z.enum(["extra_fine", "fine", "medium", "coarse"]).optional(),
        brewMethod: z.enum(["pour_over", "french_press", "aeropress", "espresso", "drip", "cold_brew"]).optional(),
        waterTemp: z.string().optional(),
        brewTime: z.string().optional(),
        coffeeAmount: z.string().optional(),
        waterAmount: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
        tastingNotes: z.string().optional(),
        observations: z.string().optional(),
        photoData: z.string().max(15_000_000).optional(), // Base64 image (~11MB cap) — replaces existing photo
        removePhoto: z.boolean().optional(), // Clears the existing photo
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, photoData, removePhoto, ...rest } = input;
        const updates: Record<string, unknown> = { ...rest };

        // Capture the prior photo key so we can reclaim it if it changes.
        let oldPhotoKey: string | null | undefined;
        if (photoData || removePhoto) {
          const existing = await brewJournalDb.getBrewEntryById(id, ctx.user.id);
          oldPhotoKey = existing?.photoKey;
        }

        // Story 1.1 / FR-13: photo edit on update.
        if (photoData) {
          const base64Data = photoData.split(",")[1] || photoData;
          const buffer = Buffer.from(base64Data, "base64");
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(7);
          const photoKey = `brew-photos/${ctx.user.id}/${timestamp}-${randomSuffix}.jpg`;
          const result = await storagePut(photoKey, buffer, "image/jpeg");
          updates.photoUrl = result.url;
          updates.photoKey = photoKey;
        } else if (removePhoto) {
          updates.photoUrl = null;
          updates.photoKey = null;
        }

        await brewJournalDb.updateBrewEntry(id, ctx.user.id, updates as any);

        // Reclaim the replaced/removed photo (best-effort).
        if ((photoData || removePhoto) && oldPhotoKey && oldPhotoKey !== updates.photoKey) {
          await storageDelete(oldPhotoKey);
        }
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Reclaim the entry's photo (best-effort) before deleting the row.
        const existing = await brewJournalDb.getBrewEntryById(input.id, ctx.user.id);
        await brewJournalDb.deleteBrewEntry(input.id, ctx.user.id);
        await storageDelete(existing?.photoKey);
        return { success: true };
      }),
  }),

  // Roasters router
  roasters: router({
    list: publicProcedure
      .input(z.object({
        origin: z.string().optional(),
        minRating: z.number().min(0).max(5).optional(),
      }).optional())
      .query(async ({ input }) => {
        if (input?.origin) {
          return await roastersDb.getRoastersByOrigin(input.origin);
        }
        if (input?.minRating) {
          return await roastersDb.getRoastersByRating(input.minRating);
        }
        return await roastersDb.getAllRoasters();
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await roastersDb.getRoasterById(input.id);
      }),
    
    reviews: publicProcedure
      .input(z.object({ roasterId: z.number() }))
      .query(async ({ input }) => {
        return await roastersDb.getReviewsByRoaster(input.roasterId);
      }),
    
    addReview: protectedProcedure
      .input(z.object({
        roasterId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        review: z.string().optional(),
        beansPurchased: z.string().optional(),
        visitDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has already reviewed
        const hasReviewed = await roastersDb.hasUserReviewed(input.roasterId, ctx.user.id);
        if (hasReviewed) {
          throw new Error("You have already reviewed this roaster");
        }

        const reviewId = await roastersDb.createReview({
          ...input,
          userId: ctx.user.id,
        });

        return { id: reviewId };
      }),

    // Mark a review helpful (Story 3.1 / FR-15) — idempotent per user.
    markReviewHelpful: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await roastersDb.markReviewHelpful(input.reviewId, ctx.user.id);
      }),
  }),

  // User Profile router
  userProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await userProfileDb.getUserProfile(ctx.user.id);
    }),
    
    save: protectedProcedure
      .input(z.object({
        flavorPreference: z.string().optional(),
        roastPreference: z.string().optional(),
        tasteSensitivity: z.string().optional(),
        acidityPreference: z.string().optional(),
        brewingMethod: z.string().optional(),
        originInterest: z.string().optional(),
        sweetnessLevel: z.string().optional(),
        bodyPreference: z.string().optional(),
        profileType: z.string().optional(),
        profileDescription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profileId = await userProfileDb.upsertUserProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { id: profileId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
