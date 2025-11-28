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

describe("userProfile API", () => {
  it("should save a user profile successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.userProfile.save({
      flavorPreference: "bright_fruity",
      roastPreference: "light",
      tasteSensitivity: "moderate",
      acidityPreference: "high",
      brewingMethod: "pour_over",
      originInterest: "african",
      sweetnessLevel: "balanced",
      bodyPreference: "medium",
      profileType: "The Bright Enthusiast",
      profileDescription: "You love vibrant, fruity coffees with high acidity.",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should retrieve a user profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save a profile first
    await caller.userProfile.save({
      flavorPreference: "sweet_caramel",
      roastPreference: "medium",
      profileType: "The Sweet Seeker",
      profileDescription: "You enjoy smooth, sweet coffees.",
    });

    // Retrieve the profile
    const profile = await caller.userProfile.get();

    expect(profile).not.toBeNull();
    expect(profile?.flavorPreference).toBe("sweet_caramel");
    expect(profile?.roastPreference).toBe("medium");
    expect(profile?.profileType).toBe("The Sweet Seeker");
  });

  it("should update an existing profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save initial profile
    await caller.userProfile.save({
      flavorPreference: "nutty_earthy",
      roastPreference: "dark",
      profileType: "The Earthy Connoisseur",
    });

    // Update the profile
    await caller.userProfile.save({
      flavorPreference: "bright_fruity",
      roastPreference: "light",
      profileType: "The Bright Enthusiast",
      profileDescription: "Changed my mind!",
    });

    // Verify the update
    const profile = await caller.userProfile.get();
    expect(profile?.flavorPreference).toBe("bright_fruity");
    expect(profile?.roastPreference).toBe("light");
    expect(profile?.profileType).toBe("The Bright Enthusiast");
    expect(profile?.profileDescription).toBe("Changed my mind!");
  });

  it("should return null for users without a profile", async () => {
    const ctx = createAuthContext(999); // New user ID
    const caller = appRouter.createCaller(ctx);

    const profile = await caller.userProfile.get();
    expect(profile).toBeNull();
  });

  it("should handle partial profile updates", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save initial profile
    await caller.userProfile.save({
      flavorPreference: "sweet_caramel",
      roastPreference: "medium",
      acidityPreference: "low",
      profileType: "The Sweet Seeker",
    });

    // Update only some fields
    await caller.userProfile.save({
      roastPreference: "medium_dark",
      bodyPreference: "full",
    });

    // Verify partial update
    const profile = await caller.userProfile.get();
    expect(profile?.roastPreference).toBe("medium_dark");
    expect(profile?.bodyPreference).toBe("full");
    // Original fields should still exist
    expect(profile?.flavorPreference).toBe("sweet_caramel");
  });

  it("should isolate profiles between different users", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 saves a profile
    await caller1.userProfile.save({
      flavorPreference: "bright_fruity",
      profileType: "User 1 Profile",
    });

    // User 2 saves a different profile
    await caller2.userProfile.save({
      flavorPreference: "nutty_earthy",
      profileType: "User 2 Profile",
    });

    // Verify isolation
    const profile1 = await caller1.userProfile.get();
    const profile2 = await caller2.userProfile.get();

    expect(profile1?.profileType).toBe("User 1 Profile");
    expect(profile2?.profileType).toBe("User 2 Profile");
    expect(profile1?.flavorPreference).not.toBe(profile2?.flavorPreference);
  });
});
