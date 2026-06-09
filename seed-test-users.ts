import { getDb } from "./server/db";
import { users } from "./drizzle/schema";

async function seedTestUsers() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Не удалось подключиться к базе данных");
    process.exit(1);
  }

  const testUsers = [
    {
      openId: "test-user-1",
      name: "Иван Пользователь",
      email: "user@test.com",
      loginMethod: "test",
      role: "user" as const,
    },
    {
      openId: "test-trainer-1",
      name: "Сергей Тренер",
      email: "trainer@test.com",
      loginMethod: "test",
      role: "trainer" as const,
    },
    {
      openId: "test-admin-1",
      name: "Администратор",
      email: "admin@test.com",
      loginMethod: "test",
      role: "admin" as const,
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
      console.error(
        `❌ Ошибка при добавлении ${user.name}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("\n✅ Готово!\n");
  console.log("📋 Тестовые аккаунты:");
  console.log("  👤 Пользователь: user@test.com (role: user)");
  console.log("  👨‍🏫 Тренер: trainer@test.com (role: trainer)");
  console.log("  👨‍💼 Админ: admin@test.com (role: admin)\n");

  process.exit(0);
}

seedTestUsers().catch((error) => {
  console.error("❌ Ошибка:", error);
  process.exit(1);
});
