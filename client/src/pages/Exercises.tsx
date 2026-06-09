import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Exercises() {
  const { data: exercises, isLoading, error } = trpc.exercises.list.useQuery({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter exercises by search and category
  const filteredExercises = exercises?.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = Array.from(new Set(exercises?.map((e) => e.category) || []));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Справочник упражнений</h1>
        <p className="text-muted-foreground">Обозревайте и открывайте упражнения для своих тренировок.</p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="card-base border-destructive bg-destructive/10">
          <p className="text-destructive">Ошибка при загрузке упражнений: {error.message}</p>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Загрузка упражнений...</p>
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <div className="flex gap-4">
            <Input
              placeholder="Поиск упражнений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exercises Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="card-base">
                  <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{exercise.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="badge-primary">{exercise.category}</span>
                    <span className="badge-accent">{exercise.difficulty}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  {exercises && exercises.length === 0 ? "Упражнения не найдены" : "Нет упражнений по вашему запросу"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
