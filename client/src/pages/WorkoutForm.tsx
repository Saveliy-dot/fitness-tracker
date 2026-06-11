import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function WorkoutForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<Array<{ exerciseId: number; sets: number; reps: number; weight?: number }>>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");

  const { data: exerciseList, isLoading: exercisesLoading, error: exercisesError } = trpc.exercises.list.useQuery({});
  const utils = trpc.useUtils();
  const createWorkout = trpc.workouts.create.useMutation();
  const addExercise = trpc.workouts.addExercise.useMutation();

  const handleAddExercise = () => {
    const errors: string[] = [];

    if (!selectedExercise) {
      errors.push("Выберите упражнение");
    }

    if (!sets || isNaN(parseInt(sets)) || parseInt(sets) < 1) {
      errors.push("Введите корректное количество подходов (минимум 1)");
    }

    if (!reps || isNaN(parseInt(reps)) || parseInt(reps) < 1) {
      errors.push("Введите корректное количество повторений (минимум 1)");
    }

    if (weight && isNaN(parseFloat(weight))) {
      errors.push("Введите корректный вес");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    exercises.push({
      exerciseId: parseInt(selectedExercise),
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : undefined,
    });
    setExercises([...exercises]);
    setSelectedExercise("");
    setSets("3");
    setReps("10");
    setWeight("");
    toast.success("Упражнение добавлено!");
  };

  const handleSubmit = async () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("Введите название тренировки");
    }

    if (!date) {
      errors.push("Выберите дату");
    }

    if (exercises.length === 0) {
      errors.push("Добавьте хотя бы одно упражнение");
    }

    if (duration && (isNaN(parseInt(duration)) || parseInt(duration) < 1)) {
      errors.push("Введите корректную длительность (минимум 1 минута)");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    try {
      const workout = await createWorkout.mutateAsync({
        name: name.trim(),
        date: new Date(date).toISOString(),
        notes,
        duration: duration ? parseInt(duration) : undefined,
      });

      for (const exercise of exercises) {
        await addExercise.mutateAsync({
          workoutId: workout?.id || 0,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
        });
      }

      await utils.workouts.invalidate();
      toast.success("Тренировка успешно добавлена!");
      setOpen(false);
      setName("");
      setDate(new Date().toISOString().split('T')[0]);
      setNotes("");
      setDuration("");
      setExercises([]);
    } catch (error) {
        console.error("FULL ERROR:", error);
        toast.error(
          error instanceof Error ? error.message : "Ошибка при добавлении тренировки"
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Добавить тренировку
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Добавить новую тренировку</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Название тренировки</Label>
            <Input
              id="name"
              placeholder="Например: Силовая тренировка"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="duration">Продолжительность (минут)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Input
              id="notes"
              placeholder="Как прошла тренировка?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Добавить упражнения</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="exercise">Упражнение</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise} disabled={exercisesLoading}>
                  <SelectTrigger id="exercise">
                    {exercisesLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Загрузка...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Выберите упражнение" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {exercisesError && (
                      <div className="flex items-center gap-2 p-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Ошибка загрузки упражнений</span>
                      </div>
                    )}
                    {!exercisesLoading && (!exerciseList || exerciseList.length === 0) && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Нет доступных упражнений
                      </div>
                    )}
                    {exerciseList?.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id.toString()}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sets">Подходы</Label>
                <Input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reps">Повторения</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weight">Вес (кг)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Optional"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddExercise} variant="outline" className="w-full" disabled={exercisesLoading || !exerciseList || exerciseList.length === 0}>
              Добавить упражнение
            </Button>

            {exercises.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Выбранные упражнения:</h4>
                {exercises.map((ex, idx) => {
                  const exerciseName = exerciseList?.find(e => e.id === ex.exerciseId)?.name || `Упражнение ${ex.exerciseId}`;
                  return (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-muted p-2">
                      <span className="text-sm">
                        {exerciseName}: {ex.sets}x{ex.reps}
                        {ex.weight && ` @ ${ex.weight}kg`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="btn-primary flex-1">
              Сохранить
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
