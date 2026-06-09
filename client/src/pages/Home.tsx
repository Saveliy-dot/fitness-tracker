import { Button } from "@/components/ui/button";
import { Activity, Apple, Calendar, TrendingUp, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
          </div>
          <Button onClick={() => setLocation('/login')}>Вход</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
                Трансформируй свой фитнес путь
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Отслеживай свои тренировки, контролируй питание и достигай своих целей с нашей комплексной платформой управления фитнесом.
              </p>
              <Button size="lg" onClick={() => setLocation('/register')}>
                Начать
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-80 w-80 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
                <Activity className="h-full w-full text-primary opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-card">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Основные возможности</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="card-base">
              <Activity className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Отслеживание тренировок</h3>
              <p className="text-sm text-muted-foreground">
                Записывай упражнения, подходы, повторения и вес для контроля прогресса.
              </p>
            </div>
            <div className="card-base">
              <Apple className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-semibold text-foreground">Дневник питания</h3>
              <p className="text-sm text-muted-foreground">
                Отслеживай приемы пищи и автоматически рассчитывай значения КБЖУ.
              </p>
            </div>
            <div className="card-base">
              <Calendar className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Встречи</h3>
              <p className="text-sm text-muted-foreground">
                Бронируй сеансы с тренерами и управляй своим расписанием.
              </p>
            </div>
            <div className="card-base">
              <TrendingUp className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-semibold text-foreground">Графики прогресса</h3>
              <p className="text-sm text-muted-foreground">
                Визуализируй свой прогресс с помощью подробной аналитики.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="section-spacing">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Для всех</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="card-base">
              <Users className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-foreground">Клиенты</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Отслеживай свой фитнес путь с комплексными логами тренировок и питания.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Личный кабинет</li>
                <li>✓ Логирование тренировок</li>
                <li>✓ Отслеживание питания</li>
                <li>✓ Визуализация прогресса</li>
              </ul>
            </div>
            <div className="card-base">
              <Activity className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 text-xl font-bold text-foreground">Тренеры</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Управляй своими клиентами и отслеживай их прогресс эффективно.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Управление клиентами</li>
                <li>✓ Планирование доступности</li>
                <li>✓ Управление встречами</li>
                <li>✓ Мониторинг прогресса</li>
              </ul>
            </div>
            <div className="card-base">
              <TrendingUp className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-foreground">Администраторы</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Управляй всей платформой и всеми ее пользователями.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Управление пользователями</li>
                <li>✓ Библиотека упражнений</li>
                <li>✓ Управление тренерами</li>
                <li>✓ Системная аналитика</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-r from-primary to-accent">
        <div className="container text-center">
          <h2 className="mb-6 text-3xl font-bold text-primary-foreground">Готов начать?</h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Присоединяйся к тысячам пользователей, трансформирующих свой фитнес путь.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation('/login')}>
            Войти сейчас
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 FitTracker. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
