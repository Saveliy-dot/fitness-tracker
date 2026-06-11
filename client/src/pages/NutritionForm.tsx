import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function NutritionForm() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [foodSearch, setFoodSearch] = useState("");

  const { data: foods, isLoading: foodsLoading, error: foodsError } = trpc.foods.list.useQuery();
  const utils = trpc.useUtils();
  const addMeal = trpc.meals.create.useMutation();

  // Filter foods by search
  const filteredFoods = foods?.filter((food: any) =>
    food.name.toLowerCase().includes(foodSearch.toLowerCase())
  ) || [];
  const selectedFoodItem = foods?.find((food: any) => food.id.toString() === selectedFood);
  const quantityValue = parseFloat(quantity) || 0;
  const macroMultiplier = quantityValue / 100;
  const calculatedMacros = selectedFoodItem
    ? {
        calories: Number(selectedFoodItem.calories || 0) * macroMultiplier,
        protein: Number(selectedFoodItem.protein || 0) * macroMultiplier,
        fat: Number(selectedFoodItem.fat || 0) * macroMultiplier,
        carbs: Number(selectedFoodItem.carbs || 0) * macroMultiplier,
      }
    : null;

  const handleSubmit = async () => {
    const errors: string[] = [];

    if (!date) {
      errors.push("Выберите дату");
    }

    if (!selectedFood) {
      errors.push("Выберите продукт");
    }

    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      errors.push("Введите корректное количество (больше 0)");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    try {
      await addMeal.mutateAsync({
        foodId: parseInt(selectedFood),
        date: new Date(date),
        quantity: parseFloat(quantity),
        mealType,
      });

      await utils.meals.invalidate();
      toast.success("Прием пищи успешно добавлен с рассчитанными КБЖУ!");
      setOpen(false);
      setDate(new Date().toISOString().split('T')[0]);
      setQuantity("100");
      setSelectedFood("");
      setFoodSearch("");
    } catch (error) {
      toast.error("Ошибка при добавлении приема пищи");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Добавить прием пищи
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить прием пищи</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Дата</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="mealType">Тип приема</Label>
            <Select value={mealType} onValueChange={(value) => setMealType(value as "breakfast" | "lunch" | "dinner" | "snack")}>
              <SelectTrigger id="mealType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Завтрак</SelectItem>
                <SelectItem value="lunch">Обед</SelectItem>
                <SelectItem value="dinner">Ужин</SelectItem>
                <SelectItem value="snack">Прокуска</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="foodSearch">Поиск продукта</Label>
            <Input
              id="foodSearch"
              placeholder="Введите название продукта..."
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              disabled={foodsLoading}
            />
          </div>

          <div>
            <Label htmlFor="food">Выбранный продукт</Label>
            {foodsError ? (
              <div className="mt-2 flex items-center gap-2 rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Ошибка при загрузке продуктов
              </div>
            ) : foodsLoading ? (
              <div className="mt-2 flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка продуктов...
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="mt-2 rounded border border-muted bg-muted/50 p-3 text-center text-sm text-muted-foreground">
                {foodSearch ? "Продукты не найдены" : "Нет доступных продуктов"}
              </div>
            ) : (
              <Select value={selectedFood} onValueChange={setSelectedFood}>
                <SelectTrigger id="food">
                  <SelectValue placeholder="Выберите продукт из списка" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFoods.map((food: any) => (
                    <SelectItem key={food.id} value={food.id.toString()}>
                      {food.name} ({Math.round(food.calories)} ккал)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Количество (г)</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {calculatedMacros && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="mb-2 font-medium text-foreground">Автоматический расчет КБЖУ</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="font-semibold text-primary">{Math.round(calculatedMacros.calories)}</p>
                  <p className="text-muted-foreground">ккал</p>
                </div>
                <div>
                  <p className="font-semibold text-accent">{Math.round(calculatedMacros.protein)}г</p>
                  <p className="text-muted-foreground">белки</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">{Math.round(calculatedMacros.fat)}г</p>
                  <p className="text-muted-foreground">жиры</p>
                </div>
                <div>
                  <p className="font-semibold text-accent">{Math.round(calculatedMacros.carbs)}г</p>
                  <p className="text-muted-foreground">углеводы</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="btn-primary flex-1" disabled={addMeal.isPending || !selectedFood}>
              {addMeal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Добавление...
                </>
              ) : (
                "Добавить"
              )}
            </Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
