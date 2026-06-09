import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  time,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with fitness-specific fields.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }),
    name: text("name"),
    loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
    role: mysqlEnum("role", ["user", "trainer", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("role_idx").on(table.role),
    emailIdx: index("email_idx").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profiles with fitness-specific information
 */
export const profiles = mysqlTable(
  "profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    age: int("age"),
    weight: decimal("weight", { precision: 5, scale: 2 }), // kg
    height: int("height"), // cm
    goal: mysqlEnum("goal", ["weight_loss", "muscle_gain", "maintenance", "endurance"]),
    bio: text("bio"),
    profileImage: varchar("profileImage", { length: 512 }), // S3 URL
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("profile_userId_idx").on(table.userId),
  })
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Exercise reference library
 */
export const exercises = mysqlTable(
  "exercises",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: mysqlEnum("category", [
      "chest",
      "back",
      "shoulders",
      "biceps",
      "triceps",
      "forearms",
      "legs",
      "glutes",
      "core",
      "cardio",
      "flexibility",
      "other",
    ]).notNull(),
    description: text("description"),
    muscleGroup: varchar("muscleGroup", { length: 255 }),
    difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
    instructions: text("instructions"),
    imageUrl: varchar("imageUrl", { length: 512 }), // S3 URL
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("exercise_category_idx").on(table.category),
    nameIdx: index("exercise_name_idx").on(table.name),
  })
);

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

/**
 * Workout sessions
 */
export const workouts = mysqlTable(
  "workouts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    date: date("date").notNull(),
    notes: text("notes"),
    duration: int("duration"), // minutes
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("workout_userId_idx").on(table.userId),
    dateIdx: index("workout_date_idx").on(table.date),
  })
);

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;

/**
 * Individual exercises logged in workouts
 */
export const workoutExercises = mysqlTable(
  "workoutExercises",
  {
    id: int("id").autoincrement().primaryKey(),
    workoutId: int("workoutId").notNull(),
    exerciseId: int("exerciseId").notNull(),
    sets: int("sets").notNull(),
    reps: int("reps").notNull(),
    weight: decimal("weight", { precision: 6, scale: 2 }), // kg
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    workoutIdIdx: index("workoutExercise_workoutId_idx").on(table.workoutId),
    exerciseIdIdx: index("workoutExercise_exerciseId_idx").on(table.exerciseId),
  })
);

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = typeof workoutExercises.$inferInsert;

/**
 * Food reference library
 */
export const foods = mysqlTable(
  "foods",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    calories: decimal("calories", { precision: 8, scale: 2 }), // per 100g
    protein: decimal("protein", { precision: 5, scale: 2 }), // grams per 100g
    fat: decimal("fat", { precision: 5, scale: 2 }), // grams per 100g
    carbs: decimal("carbs", { precision: 5, scale: 2 }), // grams per 100g
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("food_name_idx").on(table.name),
  })
);

export type Food = typeof foods.$inferSelect;
export type InsertFood = typeof foods.$inferInsert;

/**
 * Meals logged by users
 */
export const meals = mysqlTable(
  "meals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    foodId: int("foodId").notNull(),
    quantity: decimal("quantity", { precision: 6, scale: 2 }), // grams
    mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("meal_userId_idx").on(table.userId),
    dateIdx: index("meal_date_idx").on(table.date),
    foodIdIdx: index("meal_foodId_idx").on(table.foodId),
  })
);

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = typeof meals.$inferInsert;

/**
 * Appointments between users and trainers
 */
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    trainerId: int("trainerId").notNull(),
    startTime: timestamp("startTime").notNull(),
    endTime: timestamp("endTime").notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("appointment_userId_idx").on(table.userId),
    trainerIdIdx: index("appointment_trainerId_idx").on(table.trainerId),
    statusIdx: index("appointment_status_idx").on(table.status),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Trainer availability slots
 */
export const trainerAvailability = mysqlTable(
  "trainerAvailability",
  {
    id: int("id").autoincrement().primaryKey(),
    trainerId: int("trainerId").notNull(),
    dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
    startTime: time("startTime").notNull(),
    endTime: time("endTime").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    trainerIdIdx: index("availability_trainerId_idx").on(table.trainerId),
  })
);

export type TrainerAvailability = typeof trainerAvailability.$inferSelect;
export type InsertTrainerAvailability = typeof trainerAvailability.$inferInsert;

/**
 * Weight history for progress tracking
 */
export const weightHistory = mysqlTable(
  "weightHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // kg
    date: date("date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("weight_userId_idx").on(table.userId),
    dateIdx: index("weight_date_idx").on(table.date),
  })
);

export type WeightHistory = typeof weightHistory.$inferSelect;
export type InsertWeightHistory = typeof weightHistory.$inferInsert;
