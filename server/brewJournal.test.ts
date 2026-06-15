import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: string | number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: String(userId),
    name: `Test User ${String(userId)}`,
    email: `${String(userId)}@example.com`,
    emailVerified: true,
    image: null,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
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

describe("brewJournal API", () => {
  it("should create a brew entry successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.brewJournal.create({
      beanName: "Ethiopian Yirgacheffe",
      origin: "Ethiopia",
      roastLevel: "light",
      grindSize: "medium",
      brewMethod: "pour_over",
      waterTemp: "200°F",
      brewTime: "3:00",
      coffeeAmount: "20g",
      waterAmount: "300g",
      rating: 5,
      tastingNotes: "Floral, citrus, tea-like",
      observations: "Perfect extraction, will repeat",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list brew entries for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test entry first
    await caller.brewJournal.create({
      beanName: "Colombian Supremo",
      origin: "Colombia",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "french_press",
      rating: 4,
      tastingNotes: "Caramel, nutty",
    });

    // List entries
    const entries = await caller.brewJournal.list();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    
    const entry = entries[0];
    expect(entry).toHaveProperty("beanName");
    expect(entry).toHaveProperty("origin");
    expect(entry).toHaveProperty("brewMethod");
    expect(entry.userId).toBe(ctx.user!.id);
  });

  it("should filter brew entries by method", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create entries with different methods
    await caller.brewJournal.create({
      beanName: "Test Pour Over",
      origin: "Ethiopia",
      roastLevel: "light",
      grindSize: "medium",
      brewMethod: "pour_over",
      rating: 5,
    });

    await caller.brewJournal.create({
      beanName: "Test French Press",
      origin: "Colombia",
      roastLevel: "medium",
      grindSize: "coarse",
      brewMethod: "french_press",
      rating: 4,
    });

    // Filter by pour_over
    const pourOverEntries = await caller.brewJournal.list({ brewMethod: "pour_over" });
    
    expect(pourOverEntries.every(e => e.brewMethod === "pour_over")).toBe(true);
  });

  it("should get a specific brew entry by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry
    const created = await caller.brewJournal.create({
      beanName: "Kenyan AA",
      origin: "Kenya",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "pour_over",
      rating: 5,
      tastingNotes: "Berry, wine-like",
    });

    // Get the entry
    const entry = await caller.brewJournal.get({ id: created.id });

    expect(entry).not.toBeNull();
    expect(entry?.beanName).toBe("Kenyan AA");
    expect(entry?.origin).toBe("Kenya");
  });

  it("should update a brew entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry
    const created = await caller.brewJournal.create({
      beanName: "Test Bean",
      origin: "Test Origin",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "pour_over",
      rating: 3,
    });

    // Update the entry
    await caller.brewJournal.update({
      id: created.id,
      rating: 5,
      tastingNotes: "Much better after adjustments!",
    });

    // Verify the update
    const updated = await caller.brewJournal.get({ id: created.id });
    expect(updated?.rating).toBe(5);
    expect(updated?.tastingNotes).toBe("Much better after adjustments!");
  });

  it("should delete a brew entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry
    const created = await caller.brewJournal.create({
      beanName: "To Delete",
      origin: "Test",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "pour_over",
      rating: 3,
    });

    // Delete the entry
    const result = await caller.brewJournal.delete({ id: created.id });
    expect(result.success).toBe(true);

    // Verify it's deleted
    const deleted = await caller.brewJournal.get({ id: created.id });
    expect(deleted).toBeNull();
  });

  it("should not allow access to other users' entries", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 creates an entry
    const created = await caller1.brewJournal.create({
      beanName: "User 1 Bean",
      origin: "Private",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "pour_over",
      rating: 5,
    });

    // User 2 tries to access it
    const entry = await caller2.brewJournal.get({ id: created.id });
    expect(entry).toBeNull();
  });
});
