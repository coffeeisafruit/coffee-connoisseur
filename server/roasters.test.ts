import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("roasters API", () => {
  it("should list all roasters", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const roasters = await caller.roasters.list();

    expect(Array.isArray(roasters)).toBe(true);
  });

  it("should filter roasters by origin", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const roasters = await caller.roasters.list({ origin: "Ethiopia" });

    expect(Array.isArray(roasters)).toBe(true);
    // If there are results, they should contain Ethiopia in bean origins
    if (roasters.length > 0) {
      const hasEthiopia = roasters.some(r => 
        r.beanOrigins && r.beanOrigins.includes("Ethiopia")
      );
      expect(hasEthiopia).toBe(true);
    }
  });

  it("should filter roasters by minimum rating", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const roasters = await caller.roasters.list({ minRating: 4 });

    expect(Array.isArray(roasters)).toBe(true);
    // All returned roasters should have rating >= 4
    roasters.forEach(r => {
      expect((r.averageRating || 0) >= 4).toBe(true);
    });
  });

  it("should get a specific roaster by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get all roasters
    const allRoasters = await caller.roasters.list();
    
    if (allRoasters.length > 0) {
      const firstRoaster = allRoasters[0];
      const roaster = await caller.roasters.get({ id: firstRoaster.id });

      expect(roaster).not.toBeNull();
      expect(roaster?.id).toBe(firstRoaster.id);
      expect(roaster?.name).toBe(firstRoaster.name);
    }
  });

  it("should get reviews for a roaster", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get all roasters
    const allRoasters = await caller.roasters.list();
    
    if (allRoasters.length > 0) {
      const reviews = await caller.roasters.reviews({ roasterId: allRoasters[0].id });
      expect(Array.isArray(reviews)).toBe(true);
    }
  });

  it("should add a review for a roaster", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get all roasters
    const allRoasters = await caller.roasters.list();
    
    if (allRoasters.length > 0) {
      const roasterId = allRoasters[0].id;
      
      const result = await caller.roasters.addReview({
        roasterId,
        rating: 5,
        title: "Excellent coffee!",
        review: "Great quality beans and friendly staff",
        beansPurchased: "Ethiopian Yirgacheffe",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    }
  });

  it("should prevent duplicate reviews from same user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Get all roasters
    const allRoasters = await caller.roasters.list();
    
    if (allRoasters.length > 0) {
      const roasterId = allRoasters[0].id;
      
      // Add first review
      await caller.roasters.addReview({
        roasterId,
        rating: 4,
        title: "Good coffee",
        review: "Nice place to visit",
      });

      // Try to add second review - should fail
      try {
        await caller.roasters.addReview({
          roasterId,
          rating: 5,
          title: "Even better!",
          review: "Changed my mind, it's great",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("already reviewed");
      }
    }
  });

  it("should allow different users to review the same roaster", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // Get all roasters
    const allRoasters = await caller1.roasters.list();
    
    if (allRoasters.length > 0) {
      const roasterId = allRoasters[0].id;
      
      // User 1 adds review
      const review1 = await caller1.roasters.addReview({
        roasterId,
        rating: 5,
        title: "User 1 review",
      });

      // User 2 adds review
      const review2 = await caller2.roasters.addReview({
        roasterId,
        rating: 4,
        title: "User 2 review",
      });

      expect(review1.id).not.toBe(review2.id);
    }
  });
});
