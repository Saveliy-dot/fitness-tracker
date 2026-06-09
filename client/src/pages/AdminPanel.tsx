import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPanel() {
  // Users
  const { data: users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = trpc.admin.users.list.useQuery();
  const updateUserRole = trpc.admin.users.updateRole.useMutation();
  const deleteUser = trpc.admin.users.delete.useMutation();

  // Exercises
  const { data: exercises, isLoading: exercisesLoading, error: exercisesError, refetch: refetchExercises } = trpc.admin.exercises.list.useQuery();
  const createExercise = trpc.admin.exercises.create.useMutation();
  const updateExercise = trpc.admin.exercises.update.useMutation();
  const deleteExercise = trpc.admin.exercises.delete.useMutation();

  // Foods
  const { data: foods, isLoading: foodsLoading, error: foodsError, refetch: refetchFoods } = trpc.admin.foods.list.useQuery();
  const createFood = trpc.admin.foods.create.useMutation();
  const updateFood = trpc.admin.foods.update.useMutation();
  const deleteFood = trpc.admin.foods.delete.useMutation();

  // Statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.statistics.overview.useQuery();

  // Trainers
  const { data: trainers, isLoading: trainersLoading } = trpc.admin.trainers.list.useQuery();

  // State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);

  const [createExerciseOpen, setCreateExerciseOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseCategory, setExerciseCategory] = useState("chest");
  const [exerciseDifficulty, setExerciseDifficulty] = useState("beginner");
  const [exerciseDescription, setExerciseDescription] = useState("");

  const [createFoodOpen, setCreateFoodOpen] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodCalories, setFoodCalories] = useState("");
  const [foodProtein, setFoodProtein] = useState("");
  const [foodFat, setFoodFat] = useState("");
  const [foodCarbs, setFoodCarbs] = useState("");
  const [foodCategory, setFoodCategory] = useState("protein");

  // Handlers
  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) {
      toast.error("Выберите новую роль");
      return;
    }

    try {
      await updateUserRole.mutateAsync({
        userId: editingUser.id,
        role: newRole as "user" | "trainer" | "admin",
      });
      toast.success("Роль пользователя обновлена!");
      setEditUserDialogOpen(false);
      setEditingUser(null);
      refetchUsers();
    } catch (error) {
      toast.error("Ошибка при обновлении роли");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        await deleteUser.mutateAsync(userId);
        toast.success("Пользователь удален!");
        refetchUsers();
      } catch (error) {
        toast.error("Ошибка при удалении пользователя");
      }
    }
  };

  const handleCreateExercise = async () => {
    if (!exerciseName || !exerciseCategory) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      await createExercise.mutateAsync({
        name: exerciseName,
        category: exerciseCategory as any,
        difficulty: exerciseDifficulty as any,
        description: exerciseDescription || undefined,
      });
      toast.success("Упражнение создано!");
      setCreateExerciseOpen(false);
      setExerciseName("");
      setExerciseDescription("");
      refetchExercises();
    } catch (error) {
      toast.error("Ошибка при создании упражнения");
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (confirm("Вы уверены, что хотите удалить это упражнение?")) {
      try {
        await deleteExercise.mutateAsync(exerciseId);
        toast.success("Упражнение удалено!");
        refetchExercises();
      } catch (error) {
        toast.error("Ошибка при удалении упражнения");
      }
    }
  };

  const handleCreateFood = async () => {
    if (!foodName || !foodCalories || !foodProtein || !foodFat || !foodCarbs) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    try {
      await createFood.mutateAsync({
        name: foodName,
        calories: parseFloat(foodCalories),
        protein: parseFloat(foodProtein),
        fat: parseFloat(foodFat),
        carbs: parseFloat(foodCarbs),
        category: foodCategory as any,
      });
      toast.success("Продукт создан!");
      setCreateFoodOpen(false);
      setFoodName("");
      setFoodCalories("");
      setFoodProtein("");
      setFoodFat("");
      setFoodCarbs("");
      refetchFoods();
    } catch (error) {
      toast.error("Ошибка при создании продукта");
    }
  };

  const handleDeleteFood = async (foodId: number) => {
    if (confirm("Вы уверены, что хотите удалить этот продукт?")) {
      try {
        await deleteFood.mutateAsync(foodId);
        toast.success("Продукт удален!");
        refetchFoods();
      } catch (error) {
        toast.error("Ошибка при удалении продукта");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Панель администратора</h1>
        <p className="text-muted-foreground">Управляйте пользователями, упражнениями, продуктами и просматривайте статистику.</p>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <Card className="card-base p-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Загрузка статистики...</span>
          </div>
        </Card>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Всего пользователей</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
          </Card>
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Активных за 7 дней</p>
            <p className="text-2xl font-bold text-accent">{stats.activeUsers}</p>
          </Card>
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Всего тренировок</p>
            <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
          </Card>
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Всего приёмов пищи</p>
            <p className="text-2xl font-bold text-primary">{stats.totalMeals}</p>
          </Card>
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Всего упражнений</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalExercises}</p>
          </Card>
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Всего продуктов</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalFoods}</p>
          </Card>
          <Card className="card-base p-4">
            <p className="text-sm text-muted-foreground">Записей к тренерам</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalAppointments}</p>
          </Card>
        </div>
      ) : null}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Пользователи ({users?.length || 0})</TabsTrigger>
          <TabsTrigger value="exercises">Упражнения ({exercises?.length || 0})</TabsTrigger>
          <TabsTrigger value="foods">Продукты ({foods?.length || 0})</TabsTrigger>
          <TabsTrigger value="trainers">Тренеры ({trainers?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-4">
            {usersLoading ? (
              <Card className="card-base p-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Загрузка пользователей...</span>
                </div>
              </Card>
            ) : usersError ? (
              <Card className="card-base border-destructive p-4">
                <p className="text-center text-destructive">Ошибка при загрузке пользователей</p>
              </Card>
            ) : users && users.length > 0 ? (
              users.map((user: any) => (
                <Card key={user.id} className="card-base">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{user.name || "Без имени"}</p>
                      <p className="text-sm text-muted-foreground">{user.email || "Без email"}</p>
                      <p className="text-sm text-muted-foreground">
                        Роль: <span className="font-medium">{user.role}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editUserDialogOpen && editingUser?.id === user.id} onOpenChange={setEditUserDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Изменить роль пользователя</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Текущая роль: {editingUser?.role}</p>
                              <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Клиент</SelectItem>
                                  <SelectItem value="trainer">Тренер</SelectItem>
                                  <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleUpdateRole} className="w-full btn-primary">
                              Сохранить
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="card-base">
                <p className="text-muted-foreground">Нет пользователей</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises">
          <div className="space-y-4">
            <Dialog open={createExerciseOpen} onOpenChange={setCreateExerciseOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить упражнение
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новое упражнение</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Название</label>
                    <Input
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value)}
                      placeholder="Например: Жим лежа"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Категория</label>
                    <Select value={exerciseCategory} onValueChange={setExerciseCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chest">Грудь</SelectItem>
                        <SelectItem value="back">Спина</SelectItem>
                        <SelectItem value="shoulders">Плечи</SelectItem>
                        <SelectItem value="biceps">Бицепсы</SelectItem>
                        <SelectItem value="triceps">Трицепсы</SelectItem>
                        <SelectItem value="legs">Ноги</SelectItem>
                        <SelectItem value="core">Кор</SelectItem>
                        <SelectItem value="cardio">Кардио</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Сложность</label>
                    <Select value={exerciseDifficulty} onValueChange={setExerciseDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Начинающий</SelectItem>
                        <SelectItem value="intermediate">Средний</SelectItem>
                        <SelectItem value="advanced">Продвинутый</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Описание</label>
                    <Input
                      value={exerciseDescription}
                      onChange={(e) => setExerciseDescription(e.target.value)}
                      placeholder="Опциональное описание"
                    />
                  </div>
                  <Button onClick={handleCreateExercise} className="w-full btn-primary">
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {exercisesLoading ? (
              <Card className="card-base p-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Загрузка упражнений...</span>
                </div>
              </Card>
            ) : exercisesError ? (
              <Card className="card-base border-destructive p-4">
                <p className="text-center text-destructive">Ошибка при загрузке упражнений</p>
              </Card>
            ) : exercises && exercises.length > 0 ? (
              exercises.map((exercise: any) => (
                <Card key={exercise.id} className="card-base">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          {exercise.category}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs bg-accent/10 text-accent rounded">
                          {exercise.difficulty}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteExercise(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="card-base">
                <p className="text-muted-foreground">Нет упражнений</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Foods Tab */}
        <TabsContent value="foods">
          <div className="space-y-4">
            <Dialog open={createFoodOpen} onOpenChange={setCreateFoodOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить продукт
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новый продукт</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Название</label>
                    <Input
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="Например: Курица"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Категория</label>
                    <Select value={foodCategory} onValueChange={setFoodCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protein">Белок</SelectItem>
                        <SelectItem value="carbs">Углеводы</SelectItem>
                        <SelectItem value="fats">Жиры</SelectItem>
                        <SelectItem value="vegetables">Овощи</SelectItem>
                        <SelectItem value="fruits">Фрукты</SelectItem>
                        <SelectItem value="dairy">Молочные</SelectItem>
                        <SelectItem value="grains">Зерновые</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Калории (на 100г)</label>
                      <Input
                        type="number"
                        value={foodCalories}
                        onChange={(e) => setFoodCalories(e.target.value)}
                        placeholder="165"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Белки (г)</label>
                      <Input
                        type="number"
                        value={foodProtein}
                        onChange={(e) => setFoodProtein(e.target.value)}
                        placeholder="31"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Жиры (г)</label>
                      <Input
                        type="number"
                        value={foodFat}
                        onChange={(e) => setFoodFat(e.target.value)}
                        placeholder="3.6"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Углеводы (г)</label>
                      <Input
                        type="number"
                        value={foodCarbs}
                        onChange={(e) => setFoodCarbs(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateFood} className="w-full btn-primary">
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {foodsLoading ? (
              <Card className="card-base p-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Загружка продуктов...</span>
                </div>
              </Card>
            ) : foodsError ? (
              <Card className="card-base border-destructive p-4">
                <p className="text-center text-destructive">Ошибка при загружке продуктов</p>
              </Card>
            ) : foods && foods.length > 0 ? (
              foods.map((food: any) => (
                <Card key={food.id} className="card-base">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{food.name}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Калории</p>
                          <p className="font-medium text-foreground">{food.calories}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Белки</p>
                          <p className="font-medium text-foreground">{food.protein}г</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Жиры</p>
                          <p className="font-medium text-foreground">{food.fat}г</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Углеводы</p>
                          <p className="font-medium text-foreground">{food.carbs}г</p>
                        </div>
                      </div>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {food.category}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFood(food.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="card-base">
                <p className="text-muted-foreground">Нет продуктов</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Trainers Tab */}
        <TabsContent value="trainers">
          <div className="space-y-4">
            {trainers && trainers.length > 0 ? (
              trainers.map((trainer: any) => (
                <Card key={trainer.id} className="card-base">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{trainer.name || "Без имени"}</p>
                      <p className="text-sm text-muted-foreground">{trainer.email || "Без email"}</p>
                      <p className="mt-2 text-xs text-muted-foreground">ID: {trainer.id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(trainer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="card-base">
                <p className="text-muted-foreground">Нет тренеров</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
