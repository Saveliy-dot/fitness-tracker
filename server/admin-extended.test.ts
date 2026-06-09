import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

// Mock database context
const createMockContext = (role: "user" | "trainer" | "admin" = "admin") => ({
  user: {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } as User,
  req: {} as any,
  res: {} as any,
});

describe("Admin Foods Management", () => {
  it("should allow admin to list foods", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    // Should not throw
    expect(async () => {
      await caller.admin.foods.list();
    }).not.toThrow();
  });

  it("should deny user access to list foods", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.foods.list();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny trainer access to list foods", async () => {
    const ctx = createMockContext("trainer");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.foods.list();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny user access to create food", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.foods.create({
        name: "Test Food",
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 15,
        category: "protein",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny user access to update food", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.foods.update({
        foodId: 1,
        name: "Updated Food",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny user access to delete food", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.foods.delete(1);
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });
});

describe("Admin Exercises Management", () => {
  it("should allow admin to create exercise", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    // Should not throw
    expect(async () => {
      await caller.admin.exercises.create({
        name: "Test Exercise",
        category: "chest",
        difficulty: "beginner",
      });
    }).not.toThrow();
  });

  it("should deny user access to create exercise", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.exercises.create({
        name: "Test Exercise",
        category: "chest",
        difficulty: "beginner",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny trainer access to create exercise", async () => {
    const ctx = createMockContext("trainer");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.exercises.create({
        name: "Test Exercise",
        category: "chest",
        difficulty: "beginner",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny user access to update exercise", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.exercises.update({
        exerciseId: 1,
        name: "Updated Exercise",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny user access to delete exercise", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.exercises.delete(1);
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });
});

describe("Admin Statistics", () => {
  it("should allow admin to view statistics overview", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    // Should not throw
    expect(async () => {
      await caller.admin.statistics.overview();
    }).not.toThrow();
  });

  it("should deny user access to statistics overview", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.statistics.overview();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should deny trainer access to statistics overview", async () => {
    const ctx = createMockContext("trainer");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.statistics.overview();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });
});
