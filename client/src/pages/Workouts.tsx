import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { WorkoutForm } from "./WorkoutForm";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Workouts() {
  const { data: workouts, refetch } = trpc.workouts.list.useQuery({});
  const deleteWorkout = trpc.workouts.delete.useMutation();

  const handleDelete = async (workoutId: number) => {
    try {
      await deleteWorkout.mutateAsync(workoutId);
      toast.success("Тренировка удалена!");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении тренировки");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мои тренировки</h1>
          <p className="text-muted-foreground">Отслеживайте и управляйте своими тренировками.</p>
        </div>
        <WorkoutForm />
      </div>

      {workouts && workouts.length > 0 ? (
        <div className="grid gap-6">
          {workouts.map((workout) => (
            <Card key={workout.id} className="card-base">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{new Date(workout.date).toLocaleDateString()}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{workout.notes}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="badge-primary">{workout.duration || 0} мин</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(workout.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-base">
          <p className="text-center text-muted-foreground">Тренировки еще не добавлены. Начните отслеживать!</p>
        </Card>
      )}
    </div>
  );
}
