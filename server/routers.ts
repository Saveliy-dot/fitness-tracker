import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProfile,
  upsertUserProfile,
  getExercises,
  getExerciseById,
  searchExercises,
  getUserWorkouts,
  getWorkoutById,
  getWorkoutExercises,
  getUserMeals,
  getUserMealsByDateRange,
  getFoods,
  searchFoods,
  getUserAppointments,
  getAppointmentById,
  getTrainerAvailability,
  getUserWeightHistory,
  getAllUsers,
  getAllExercises,
  getAllTrainers,
} from "./db";
import { getDb } from "./db";
import {
  profiles,
  workouts,
  workoutExercises,
  meals,
  appointments,
  trainerAvailability,
  weightHistory,
  exercises,
  foods,
  users,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    testLogin: publicProcedure
      .input(z.object({ role: z.enum(["user", "trainer", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const testUserMap: Record<string, string> = {
          user: "test-user-1",
          trainer: "test-trainer-1",
          admin: "test-admin-1",
        };

        const openId = testUserMap[input.role];
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.openId, openId))
          .limit(1);

        if (!user) {
          throw new Error(`Test user with role ${input.role} not found`);
        }

        // Create a local email/password session token.
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user, {
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, redirectUrl: "/dashboard" };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return {
        success: true,
      } as const;
    }),
  }),

  // User Profile Management
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      return profile || null;
    }),

    update: protectedProcedure
      .input(
        z.object({
          age: z.number().optional(),
          weight: z.number().optional(),
          height: z.number().optional(),
          goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "endurance"]).optional(),
          bio: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: any = {};
        if (input.age !== undefined) updateData.age = input.age;
        if (input.weight !== undefined) updateData.weight = input.weight;
        if (input.height !== undefined) updateData.height = input.height;
        if (input.goal !== undefined) updateData.goal = input.goal;
        if (input.bio !== undefined) updateData.bio = input.bio;

        const existing = await getUserProfile(ctx.user.id);
        if (existing) {
          await db
            .update(profiles)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(profiles.userId, ctx.user.id));
        } else {
          await db.insert(profiles).values([{ userId: ctx.user.id, ...updateData }]);
        }

        return await getUserProfile(ctx.user.id);
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const workoutCount = await db
        .select()
        .from(workouts)
        .where(eq(workouts.userId, ctx.user.id));

      const weightData = await getUserWeightHistory(ctx.user.id);

      return {
        totalWorkouts: workoutCount.length,
        currentWeight: weightData.length > 0 ? weightData[weightData.length - 1].weight : null,
        weightHistory: weightData,
      };
    }),
  }),

  // Exercise Management
  exercises: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          difficulty: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getExercises(input.category, input.difficulty);
      }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getExerciseById(input);
    }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      return searchExercises(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          category: z.string(),
          description: z.string().optional(),
          muscleGroup: z.string().optional(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]),
          instructions: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(exercises).values({
          name: input.name,
          category: input.category as any,
          description: input.description,
          muscleGroup: input.muscleGroup,
          difficulty: input.difficulty,
          instructions: input.instructions,
        });
        return result;
      }),
  }),

  // Workout Management
  workouts: router({
    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getUserWorkouts(ctx.user.id, input.startDate, input.endDate);
      }),

    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
      const workout = await getWorkoutById(input);
      if (workout && workout.userId !== ctx.user.id) throw new Error("Unauthorized");
      return workout;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).optional(),
          date: z.string().transform((val) => new Date(val)),
          notes: z.string().optional(),
          duration: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(workouts).values([
          {
            userId: ctx.user.id,
            name: input.name?.trim() || "Тренировка",
            date: input.date,
            notes: input.notes,
            duration: input.duration,
          },
        ]);

        const insertId = Array.isArray(result) ? result[0]?.insertId : (result as any)?.insertId;
        if (insertId) {
          return getWorkoutById(insertId);
        }

        const createdWorkouts = await getUserWorkouts(ctx.user.id);
        return createdWorkouts[0];
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const workout = await getWorkoutById(input);
      if (!workout || workout.userId !== ctx.user.id) throw new Error("Unauthorized");

      await db.delete(workouts).where(eq(workouts.id, input));
      return { success: true };
    }),

    addExercise: protectedProcedure
      .input(
        z.object({
          workoutId: z.number(),
          exerciseId: z.number(),
          sets: z.number(),
          reps: z.number(),
          weight: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const workout = await getWorkoutById(input.workoutId);
        if (!workout || workout.userId !== ctx.user.id) throw new Error("Unauthorized");

        await db.insert(workoutExercises).values([
          {
            workoutId: input.workoutId,
            exerciseId: input.exerciseId,
            sets: input.sets,
            reps: input.reps,
            weight: input.weight ? (input.weight as any).toString() : undefined,
            notes: input.notes,
          },
        ]);

        // Return the created exercise
        const exercises = await getWorkoutExercises(input.workoutId);
        return exercises[exercises.length - 1];
      }),

    getExercises: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
      const workout = await getWorkoutById(input);
      if (!workout || workout.userId !== ctx.user.id) throw new Error("Unauthorized");

      return getWorkoutExercises(input);
    }),

    removeExercise: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(workoutExercises).where(eq(workoutExercises.id, input));
      return { success: true };
    }),
  }),

  // Nutrition Management
  meals: router({
    list: protectedProcedure.input(z.date()).query(async ({ ctx, input }) => {
      return getUserMeals(ctx.user.id, input);
    }),

    getByDateRange: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getUserMealsByDateRange(ctx.user.id, input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(
        z.object({
          foodId: z.number(),
          date: z.date(),
          quantity: z.number(),
          mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(meals).values([
          {
            userId: ctx.user.id,
            foodId: input.foodId,
            date: input.date,
            quantity: (input.quantity as any).toString(),
            mealType: input.mealType,
          },
        ]);

        const insertId = Array.isArray(result) ? result[0]?.insertId : (result as any)?.insertId;
        if (!insertId) return result;

        const createdMeals = await getUserMeals(ctx.user.id, input.date);
        return createdMeals.find((meal: any) => meal.id === insertId) ?? result;
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(meals).where(eq(meals.id, input));
      return { success: true };
    }),
  }),

  // Food Database
  foods: router({
    list: publicProcedure
      .query(async () => {
        return getFoods();
      }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      return searchFoods(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          calories: z.number(),
          protein: z.number(),
          fat: z.number(),
          carbs: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(foods).values([
          {
            name: input.name,
            calories: input.calories.toString() as any,
            protein: input.protein.toString() as any,
            fat: input.fat.toString() as any,
            carbs: input.carbs.toString() as any,
          },
        ]);

        return result;
      }),
  }),

  // Trainers
  trainers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return getAllTrainers();
    }),
  }),

  // Appointments
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const role = ctx.user.role === "trainer" ? "trainer" : "client";
      return getUserAppointments(ctx.user.id, role);
    }),

    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getAppointmentById(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          trainerId: z.number(),
          date: z.date(),
          time: z.string(),
          duration: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "user") throw new Error("Only clients can book appointments");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(appointments).values([
          {
            userId: ctx.user.id,
            trainerId: input.trainerId,
            startTime: new Date(`${input.date.toISOString().split('T')[0]}T${input.time}`),
            endTime: new Date(`${input.date.toISOString().split('T')[0]}T${input.time}`),
            notes: input.notes,
          },
        ]);

        return result;
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const appointment = await getAppointmentById(input);
      if (!appointment || appointment.userId !== ctx.user.id) throw new Error("Unauthorized");

      await db.delete(appointments).where(eq(appointments.id, input));

      return { success: true };
    }),

    cancel: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const appointment = await getAppointmentById(input);
      if (!appointment || appointment.userId !== ctx.user.id) throw new Error("Unauthorized");

      await db
        .update(appointments)
        .set({ status: "cancelled" })
        .where(eq(appointments.id, input));

      return { success: true };
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "trainer") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const appointment = await getAppointmentById(input.appointmentId);
        if (!appointment || appointment.trainerId !== ctx.user.id) throw new Error("Unauthorized");

        await db
          .update(appointments)
          .set({ status: input.status })
          .where(eq(appointments.id, input.appointmentId));

        return { success: true };
      }),
  }),

  // Trainer Availability
  trainerAvailability: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "trainer") throw new Error("Unauthorized");
      return getTrainerAvailability(ctx.user.id);
    }),

    set: protectedProcedure
      .input(
        z.object({
          dayOfWeek: z.number(),
          startTime: z.string(),
          endTime: z.string(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "trainer") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(trainerAvailability).values([
          {
            trainerId: ctx.user.id,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime as any,
            endTime: input.endTime as any,
          },
        ]);

        return result;
      }),
  }),

  // Weight Tracking
  weightHistory: router({
    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getUserWeightHistory(ctx.user.id, input.startDate, input.endDate);
      }),

    add: protectedProcedure
      .input(
        z.object({
          weight: z.number(),
          date: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(weightHistory).values([
          {
            userId: ctx.user.id,
            weight: input.weight.toString() as any,
            date: input.date,
            notes: input.notes,
          },
        ]);

        return result;
      }),
  }),

  // Admin Management
  admin: router({
    users: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAllUsers();
      }),

      updateRole: protectedProcedure
        .input(
          z.object({
            userId: z.number(),
            role: z.enum(["user", "trainer", "admin"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new Error("Unauthorized");

          const db = await getDb();
          if (!db) throw new Error("Database not available");

          await db
            .update(users)
            .set({ role: input.role as any })
            .where(eq(users.id, input.userId));

          return { success: true };
        }),

      delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(users).where(eq(users.id, input));
        return { success: true };
      }),
    }),

    exercises: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAllExercises();
      }),

      create: protectedProcedure
        .input(
          z.object({
            name: z.string().min(1),
            category: z.enum(["chest", "back", "shoulders", "biceps", "triceps", "forearms", "legs", "glutes", "core", "cardio", "flexibility", "other"]),
            description: z.string().optional(),
            difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
            muscleGroup: z.string().optional(),
            instructions: z.string().optional(),
            imageUrl: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new Error("Unauthorized");

          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const result = await db.insert(exercises).values([input]);
          return { success: true, id: result[0] };
        }),

      update: protectedProcedure
        .input(
          z.object({
            exerciseId: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
            difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new Error("Unauthorized");

          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const { exerciseId, ...updateData } = input;
          const updateSet: any = {};
          if (updateData.name) updateSet.name = updateData.name;
          if (updateData.description) updateSet.description = updateData.description;
          if (updateData.difficulty) updateSet.difficulty = updateData.difficulty;

          await db.update(exercises).set(updateSet).where(eq(exercises.id, exerciseId));

          return { success: true };
        }),

      delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(exercises).where(eq(exercises.id, input));
        return { success: true };
      }),
    }),

    trainers: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAllTrainers();
      }),
    }),

    foods: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return await getFoods();
      }),

      create: protectedProcedure
        .input(
          z.object({
            name: z.string().min(1),
            calories: z.number().positive(),
            protein: z.number().nonnegative(),
            fat: z.number().nonnegative(),
            carbs: z.number().nonnegative(),
            category: z.enum(["protein", "carbs", "fats", "vegetables", "fruits", "dairy", "grains", "other"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new Error("Unauthorized");

          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const result = await db.insert(foods).values([{
            name: input.name,
            calories: input.calories.toString() as any,
            protein: input.protein.toString() as any,
            fat: input.fat.toString() as any,
            carbs: input.carbs.toString() as any,
          }]);
          return { success: true, id: result[0] };
        }),

      update: protectedProcedure
        .input(
          z.object({
            foodId: z.number(),
            name: z.string().optional(),
            calories: z.number().optional(),
            protein: z.number().optional(),
            fat: z.number().optional(),
            carbs: z.number().optional(),
            servingSize: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new Error("Unauthorized");

          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const { foodId, ...updateData } = input;
          const updateSet: any = {};
          if (updateData.name) updateSet.name = updateData.name;
          if (updateData.calories !== undefined) updateSet.calories = updateData.calories;
          if (updateData.protein !== undefined) updateSet.protein = updateData.protein;
          if (updateData.fat !== undefined) updateSet.fat = updateData.fat;
          if (updateData.carbs !== undefined) updateSet.carbs = updateData.carbs;
          if (updateData.servingSize) updateSet.servingSize = updateData.servingSize;

          await db.update(foods).set(updateSet).where(eq(foods.id, foodId));
          return { success: true };
        }),

      delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(foods).where(eq(foods.id, input));
        return { success: true };
      }),
    }),

    statistics: router({
      overview: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const totalUsers = await db.select().from(users);
        const totalWorkouts = await db.select().from(workouts);
        const totalMeals = await db.select().from(meals);
        const totalAppointments = await db.select().from(appointments);
        const totalExercises = await db.select().from(exercises);
        const totalFoods = await db.select().from(foods);

        const activeUsers = totalUsers.filter(
          (u) =>
            u.lastSignedIn &&
            new Date(u.lastSignedIn).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length;

        return {
          totalUsers: totalUsers.length,
          totalWorkouts: totalWorkouts.length,
          totalMeals: totalMeals.length,
          totalAppointments: totalAppointments.length,
          totalExercises: totalExercises.length,
          totalFoods: totalFoods.length,
          activeUsers,
        };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
