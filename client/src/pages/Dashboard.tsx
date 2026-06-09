import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Apple, Calendar, TrendingUp } from "lucide-react";
import { ProgressCharts } from "./ProgressCharts";

export default function Dashboard() {
  const { data: stats } = trpc.profile.getStats.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
        <p className="text-muted-foreground">Добро пожаловать! Вот ваш обзор фитнеса.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-base">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Всего тренировок</p>
              <p className="mt-2 text-3xl font-bold text-primary">{stats?.totalWorkouts || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="card-base">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Текущий вес</p>
              <p className="mt-2 text-3xl font-bold text-accent">
                {stats?.currentWeight ? `${stats.currentWeight} кг` : "—"}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent/50" />
          </div>
        </Card>

        <Card className="card-base">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Записи о питании</p>
              <p className="mt-2 text-3xl font-bold text-primary">0</p>
            </div>
            <Apple className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="card-base">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Записи к тренеру</p>
              <p className="mt-2 text-3xl font-bold text-accent">0</p>
            </div>
            <Calendar className="h-8 w-8 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-base">
          <h3 className="mb-4 font-semibold text-foreground">Недавние тренировки</h3>
          <p className="text-sm text-muted-foreground">Тренировки еще не добавлены. Начните отслеживать свой прогресс!</p>
        </Card>

        <Card className="card-base">
          <h3 className="mb-4 font-semibold text-foreground">Предстоящие записи</h3>
          <p className="text-sm text-muted-foreground">Записи еще не запланированы. Запишитесь на сеанс с тренером!</p>
        </Card>
      </div>

      {/* Progress Visualization */}
      <ProgressCharts />
    </div>
  );
}
