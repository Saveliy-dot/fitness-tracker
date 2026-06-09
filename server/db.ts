import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  profiles,
  exercises,
  workouts,
  workoutExercises,
  meals,
  foods,
  appointments,
  trainerAvailability,
  weightHistory,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Profile helpers
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserProfile(userId);
  if (existing) {
    await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ...data });
  }
}

// Exercise helpers
export async function getExercises(category?: string, difficulty?: string) {
  const db = await getDb();
  if (!db) return [];

  if (category && difficulty) {
    return db
      .select()
      .from(exercises)
      .where(
        and(
          eq(exercises.category, category as any),
          eq(exercises.difficulty, difficulty as any)
        )
      );
  }

  if (category) {
    return db.select().from(exercises).where(eq(exercises.category, category as any));
  }

  if (difficulty) {
    return db.select().from(exercises).where(eq(exercises.difficulty, difficulty as any));
  }

  return db.select().from(exercises);
}

export async function getExerciseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchExercises(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(exercises)
    .where(eq(exercises.name, `%${query}%`));
}

// Workout helpers
export async function getUserWorkouts(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.date, startDate),
          lte(workouts.date, endDate)
        )
      )
      .orderBy(desc(workouts.date));
  }

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.date));
}

export async function getWorkoutById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getWorkoutExercises(workoutId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
}

// Meal helpers
export async function getUserMeals(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      meal: meals,
      food: foods,
    })
    .from(meals)
    .innerJoin(foods, eq(meals.foodId, foods.id))
    .where(and(eq(meals.userId, userId), eq(meals.date, date)))
    .orderBy(asc(meals.mealType));
}

export async function getUserMealsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      meal: meals,
      food: foods,
    })
    .from(meals)
    .innerJoin(foods, eq(meals.foodId, foods.id))
    .where(
      and(
        eq(meals.userId, userId),
        gte(meals.date, startDate),
        lte(meals.date, endDate)
      )
    )
    .orderBy(desc(meals.date));
}

// Food helpers
export async function getFoods() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(foods).orderBy(asc(foods.name));
}

export async function searchFoods(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(foods)
    .where(eq(foods.name, `%${query}%`))
    .limit(20);
}

// Appointment helpers
export async function getUserAppointments(userId: number, role: "client" | "trainer") {
  const db = await getDb();
  if (!db) return [];

  if (role === "client") {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.startTime));
  } else {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.trainerId, userId))
      .orderBy(desc(appointments.startTime));
  }
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Trainer availability helpers
export async function getTrainerAvailability(trainerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(trainerAvailability)
    .where(eq(trainerAvailability.trainerId, trainerId));
}

// Weight history helpers
export async function getUserWeightHistory(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return db
      .select()
      .from(weightHistory)
      .where(
        and(
          eq(weightHistory.userId, userId),
          gte(weightHistory.date, startDate),
          lte(weightHistory.date, endDate)
        )
      )
      .orderBy(asc(weightHistory.date));
  }

  return db
    .select()
    .from(weightHistory)
    .where(eq(weightHistory.userId, userId))
    .orderBy(asc(weightHistory.date));
}

// Admin helpers
export async function getAllUsers(role?: string) {
  const db = await getDb();
  if (!db) return [];

  if (role) {
    return db.select().from(users).where(eq(users.role, role as any));
  }

  return db.select().from(users);
}

export async function getAllExercises() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(exercises);
}

export async function getAllTrainers() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users).where(eq(users.role, "trainer"));
}
