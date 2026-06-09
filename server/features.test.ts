import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Increase timeout for database operations
vi.setConfig({ testTimeout: 15000 });

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("Fitness Tracker Features", () => {
  describe("Workouts", () => {
    it("should create a workout", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workouts.create({
        date: new Date(),
        notes: "Great session",
        duration: 60,
      });

      expect(result).toBeDefined();
    }, 15000);

    it("should list user workouts", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workouts.list({});

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it("should add exercise to workout", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a workout
      const workout = await caller.workouts.create({
        date: new Date(),
        notes: "Test",
        duration: 60,
      });

      // Then add an exercise using the created workout's ID
      const result = await caller.workouts.addExercise({
        workoutId: workout.id,
        exerciseId: 1,
        sets: 3,
        reps: 10,
        weight: 50,
      });

      expect(result).toBeDefined();
    }, 15000);
  });

  describe("Meals", () => {
    it("should create a meal entry", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.meals.create({
        foodId: 1,
        date: new Date(),
        quantity: 100,
        mealType: "breakfast",
      });

      expect(result).toBeDefined();
    });

    it("should list user meals for a date", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.meals.list(new Date());

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Weight Tracking", () => {
    it("should add weight entry", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.weightHistory.add({
        weight: 75,
        date: new Date(),
        notes: "Morning weigh-in",
      });

      expect(result).toBeDefined();
    });

    it("should list weight history", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.weightHistory.list({});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Exercises", () => {
    it("should list all exercises", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);

      const result = await caller.exercises.list({});

      expect(Array.isArray(result)).toBe(true);
    });

    it("should search exercises", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);

      const result = await caller.exercises.search("bench");

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Foods", () => {
    it("should list all foods", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);

      const result = await caller.foods.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should search foods", async () => {
      const caller = appRouter.createCaller({} as TrpcContext);

      const result = await caller.foods.search("chicken");

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
