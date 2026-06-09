import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Appointments() {
  const { data: appointments, isLoading, error, refetch } = trpc.appointments.list.useQuery();
  const { data: trainers, isLoading: trainersLoading } = trpc.trainers.list.useQuery();
  const createAppointment = trpc.appointments.create.useMutation();
  const deleteAppointment = trpc.appointments.delete.useMutation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ trainerId: "", date: "", time: "" });

  const handleCreateAppointment = async () => {
    if (!formData.trainerId || !formData.date || !formData.time) {
      toast.error("Заполните все поля");
      return;
    }
    try {
      await createAppointment.mutateAsync({
        trainerId: parseInt(formData.trainerId),
        date: new Date(formData.date),
        time: formData.time,
      });
      toast.success("Запись создана!");
      setFormData({ trainerId: "", date: "", time: "" });
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Ошибка при создании записи");
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await deleteAppointment.mutateAsync(appointmentId);
      toast.success("Запись отменена!");
      refetch();
    } catch (error) {
      toast.error("Ошибка при отмене записи");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Записи к тренеру</h1>
          <p className="text-muted-foreground">Управляйте своими тренировками.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">Записаться</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Запись к тренеру</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Выберите тренера</Label>
                <Select value={formData.trainerId} onValueChange={(value) => setFormData({ ...formData, trainerId: value })}>
                  <SelectTrigger disabled={trainersLoading}>
                    <SelectValue placeholder={trainersLoading ? "Загрузка тренеров..." : "Выберите тренера"} />
                  </SelectTrigger>
                  <SelectContent>
                    {trainersLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">Загрузка...</div>
                    ) : trainers && trainers.length > 0 ? (
                      trainers.map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id.toString()}>
                          {trainer.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">Нет доступных тренеров</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Время</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleCreateAppointment} 
                className="w-full btn-primary"
                disabled={createAppointment.isPending || trainersLoading}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  "Записаться"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="card-base">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Загрузка записей...</span>
          </div>
        </Card>
      ) : error ? (
        <Card className="card-base border-destructive">
          <p className="text-center text-destructive">Ошибка при загрузке записей</p>
        </Card>
      ) : appointments && appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((apt) => (
            <Card key={apt.id} className="card-base">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Тренер ID: {apt.trainerId}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(apt.startTime).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge-primary">{apt.status}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAppointment(apt.id)}
                    disabled={deleteAppointment.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    {deleteAppointment.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-base">
          <p className="text-center text-muted-foreground">Записи еще не запланированы. Запишитесь на сеанс!</p>
        </Card>
      )}
    </div>
  );
}
