import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as roastersDb from "./roasters";

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
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

async function seedRoasterWithReview(authorId: number) {
  const roasterId = await roastersDb.createRoaster({
    name: "Helpful Test Roasters",
    address: "1 Test St",
    city: "Testville",
    country: "USA",
    latitude: "0",
    longitude: "0",
  });
  const reviewId = await roastersDb.createReview({
    roasterId,
    userId: authorId,
    rating: 5,
    review: "Great beans",
  });
  return { roasterId, reviewId };
}

describe("roasters.markReviewHelpful (Story 3.1 / FR-15)", () => {
  it("increments helpful_count on a user's first vote", async () => {
    const { reviewId } = await seedRoasterWithReview(1);
    const voter = appRouter.createCaller(createAuthContext(2));

    const result = await voter.roasters.markReviewHelpful({ reviewId });

    expect(result.counted).toBe(true);
    expect(result.helpfulCount).toBe(1);
  });

  it("does not double-count a repeat vote from the same user", async () => {
    const { reviewId } = await seedRoasterWithReview(1);
    const voter = appRouter.createCaller(createAuthContext(3));

    await voter.roasters.markReviewHelpful({ reviewId });
    const second = await voter.roasters.markReviewHelpful({ reviewId });

    expect(second.counted).toBe(false);
    expect(second.helpfulCount).toBe(1);
  });

  it("rejects a vote on a non-existent review", async () => {
    const voter = appRouter.createCaller(createAuthContext(6));
    await expect(
      voter.roasters.markReviewHelpful({ reviewId: 999999 })
    ).rejects.toThrow(/not found/i);
  });

  it("counts distinct users separately", async () => {
    const { reviewId } = await seedRoasterWithReview(1);

    await appRouter.createCaller(createAuthContext(4)).roasters.markReviewHelpful({ reviewId });
    const byOther = await appRouter
      .createCaller(createAuthContext(5))
      .roasters.markReviewHelpful({ reviewId });

    expect(byOther.helpfulCount).toBe(2);
  });
});
