import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NutritionForm } from "./NutritionForm";
import { ProgressCharts } from "./ProgressCharts";
import { trpc } from "@/lib/trpc";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Nutrition() {
  const { data: meals, refetch } = trpc.meals.list.useQuery(new Date());
  const deleteMeal = trpc.meals.delete.useMutation();

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await deleteMeal.mutateAsync(mealId);
      toast.success("Прием пищи удален!");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении приема пищи");
    }
  };

  // Calculate KBZHU totals (accounting for quantity in grams)
  const totals = meals?.reduce(
    (acc, meal: any) => {
      const quantity = parseFloat(meal.quantity) || 0; // grams
      const multiplier = quantity / 100; // foods are stored per 100g
      return {
        calories: acc.calories + ((meal.food?.calories || 0) * multiplier),
        protein: acc.protein + ((meal.food?.protein || 0) * multiplier),
        fat: acc.fat + ((meal.food?.fat || 0) * multiplier),
        carbs: acc.carbs + ((meal.food?.carbs || 0) * multiplier),
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  ) || { calories: 0, protein: 0, fat: 0, carbs: 0 };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Дневник питания</h1>
          <p className="text-muted-foreground">Отслеживайте приемы пищи и мониторьте КБЖУ.</p>
        </div>
        <NutritionForm />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Калории</p>
          <p className="mt-2 text-3xl font-bold text-primary">{Math.round(totals.calories)}</p>
        </Card>
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Белки (г)</p>
          <p className="mt-2 text-3xl font-bold text-accent">{Math.round(totals.protein)}</p>
        </Card>
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Жиры (г)</p>
          <p className="mt-2 text-3xl font-bold text-primary">{Math.round(totals.fat)}</p>
        </Card>
        <Card className="card-base">
          <p className="text-sm font-medium text-muted-foreground">Углеводы (г)</p>
          <p className="mt-2 text-3xl font-bold text-accent">{Math.round(totals.carbs)}</p>
        </Card>
      </div>

      {/* Recent Meals */}
      {meals && meals.length > 0 ? (
        <Card className="card-base">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Приемы пищи сегодня</h2>
          <div className="space-y-2">
            {meals.map((meal: any) => (
              <div key={meal.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{meal.food?.name}</p>
                  <p className="text-sm text-muted-foreground">{meal.mealType} • {meal.quantity}г</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-accent">{Math.round((meal.food?.calories || 0) * (meal.quantity / 100))} кал</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="card-base">
          <p className="text-center text-muted-foreground">Приемы пищи еще не добавлены. Начните отслеживать питание!</p>
        </Card>
      )}

      {/* Progress Charts */}
      <ProgressCharts />
    </div>
  );
}
