import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function ctxFor(userId = 91): TrpcContext {
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
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("brewJournal.update photo edit (Story 1.1 / FR-13)", () => {
  it("accepts removePhoto and clears the photo without affecting other fields", async () => {
    const caller = appRouter.createCaller(ctxFor());
    const created = await caller.brewJournal.create({
      beanName: "Photo Bean",
      origin: "Brazil",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "drip",
      rating: 3,
    });

    await caller.brewJournal.update({ id: created.id, removePhoto: true, rating: 4 });

    const after = await caller.brewJournal.get({ id: created.id });
    expect(after?.photoUrl).toBeNull();
    expect(after?.photoKey).toBeNull();
    expect(after?.rating).toBe(4);
  });
});
