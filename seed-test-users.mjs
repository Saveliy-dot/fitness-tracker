import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema.js";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "fitness_tracker",
});

const db = drizzle(connection);

// Test users data
const testUsers = [
  {
    openId: "test-user-1",
    name: "Иван Пользователь",
    email: "user@test.com",
    loginMethod: "test",
    role: "user",
  },
  {
    openId: "test-trainer-1",
    name: "Сергей Тренер",
    email: "trainer@test.com",
    loginMethod: "test",
    role: "trainer",
  },
  {
    openId: "test-admin-1",
    name: "Администратор",
    email: "admin@test.com",
    loginMethod: "test",
    role: "admin",
  },
];

console.log("🌱 Добавляю тестовых пользователей...\n");

for (const user of testUsers) {
  try {
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(users.openId === user.openId)
      .limit(1);

    if (existing.length > 0) {
      console.log(`✅ ${user.name} (${user.role}) - уже существует`);
    } else {
      await db.insert(users).values(user);
      console.log(`✨ ${user.name} (${user.role}) - добавлен`);
    }
  } catch (error) {
    console.error(`❌ Ошибка при добавлении ${user.name}:`, error.message);
  }
}

console.log("\n✅ Готово!\n");
console.log("📋 Тестовые аккаунты:");
console.log("  👤 Пользователь: user@test.com (role: user)");
console.log("  👨‍🏫 Тренер: trainer@test.com (role: trainer)");
console.log("  👨‍💼 Админ: admin@test.com (role: admin)\n");

process.exit(0);
