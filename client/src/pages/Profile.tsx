import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { data: profile, refetch } = trpc.profile.get.useQuery();
  const updateProfile = trpc.profile.update.useMutation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    goal: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age?.toString() || "",
        weight: profile.weight?.toString() || "",
        height: profile.height?.toString() || "",
        goal: profile.goal || "",
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      if (!formData.age && !formData.weight && !formData.height && !formData.goal) {
        toast.error("Пожалуйста, заполните хотя бы одно поле");
        return;
      }

      const goalValue = formData.goal as "weight_loss" | "muscle_gain" | "maintenance" | "endurance" | undefined;
      await updateProfile.mutateAsync({
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        goal: goalValue || undefined,
      });
      toast.success("Профиль обновлен!");
      setOpen(false);
      refetch();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Ошибка при обновлении профиля");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мой профиль</h1>
          <p className="text-muted-foreground">Управляйте личными данными и целями фитнеса.</p>
        </div>
      </div>

      <Card className="card-base max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground">Возраст</label>
            <p className="mt-1 text-foreground">{profile?.age || "Не указан"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Вес (кг)</label>
            <p className="mt-1 text-foreground">{profile?.weight || "Не указан"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Рост (см)</label>
            <p className="mt-1 text-foreground">{profile?.height || "Не указан"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Цель</label>
            <p className="mt-1 text-foreground">{profile?.goal || "Не указана"}</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">Отредактировать</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактирование профиля</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Возраст</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Введите возраст"
                  />
                </div>
                <div>
                  <Label>Вес (кг)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Введите вес"
                  />
                </div>
                <div>
                  <Label>Рост (см)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Введите рост"
                  />
                </div>
                <div>
                  <Label>Цель</Label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Выберите цель</option>
                    <option value="weight_loss">Похудение</option>
                    <option value="muscle_gain">Набор мышц</option>
                    <option value="maintenance">Поддержание формы</option>
                    <option value="endurance">Выносливость</option>
                  </select>
                </div>
                <Button onClick={handleUpdateProfile} className="w-full btn-primary" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
