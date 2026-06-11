import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ProgressCharts() {
  const today = useMemo(() => new Date(), []);
  const { data: weights } = trpc.weightHistory.list.useQuery({});
  const { data: workouts } = trpc.workouts.list.useQuery({});
  const { data: meals } = trpc.meals.list.useQuery(today);

  // Prepare weight data
  const weightData = weights?.map((w: any) => ({
    date: new Date(w.date).toLocaleDateString(),
    weight: parseFloat(w.weight),
  })) || [];

  // Prepare calorie data
  const calorieData: Record<string, number> = {};
  meals?.forEach((meal: any) => {
    const date = new Date(meal.date).toLocaleDateString();
    calorieData[date] = (calorieData[date] || 0) + (Number(meal.calories) || 0);
  });

  const calorieChartData = Object.entries(calorieData).map(([date, calories]) => ({
    date,
    calories: Math.round(calories),
  }));

  // Prepare workout frequency data
  const workoutData: Record<string, number> = {};
  workouts?.forEach((w: any) => {
    const date = new Date(w.date).toLocaleDateString();
    workoutData[date] = (workoutData[date] || 0) + 1;
  });

  const workoutChartData = Object.entries(workoutData).map(([date, count]) => ({
    date,
    workouts: count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Визуализация прогресса</h2>
      </div>

      {/* Weight Progress Chart */}
      <Card className="card-base">
        <h3 className="mb-4 font-semibold text-foreground">Прогресс веса</h3>
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#0f9668"
                dot={{ fill: "#0f9668" }}
                name="Вес (кг)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">Нет данных о весе</p>
        )}
      </Card>

      {/* Calorie Progress Chart */}
      <Card className="card-base">
        <h3 className="mb-4 font-semibold text-foreground">Потребление калорий</h3>
        {calorieChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calorieChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#f59e0b"
                dot={{ fill: "#f59e0b" }}
                name="Калории (ккал)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">Нет данных о калориях</p>
        )}
      </Card>

      {/* Workout Frequency Chart */}
      <Card className="card-base">
        <h3 className="mb-4 font-semibold text-foreground">Частота тренировок</h3>
        {workoutChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="workouts" fill="#1e3a8a" name="Тренировки" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">Нет данных о тренировках</p>
        )}
      </Card>

      {/* Statistics Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Всего тренировок</p>
          <p className="mt-2 text-3xl font-bold text-primary">{workouts?.length || 0}</p>
        </Card>
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Текущий вес</p>
          <p className="mt-2 text-3xl font-bold text-accent">
            {weightData.length > 0 ? `${weightData[weightData.length - 1].weight} кг` : "—"}
          </p>
        </Card>
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Изменение веса</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {weightData.length > 1
              ? `${(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)} кг`
              : "—"}
          </p>
        </Card>
      </div>
    </div>
  );
}
