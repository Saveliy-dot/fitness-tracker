import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Download, FileText, Table } from "lucide-react";

export function ExportData() {
  const { data: workouts } = trpc.workouts.list.useQuery({});
  const { data: meals } = trpc.meals.list.useQuery(new Date());
  const { data: profile } = trpc.profile.get.useQuery();

  const exportToCSV = () => {
    try {
      // Prepare data
      const headers = ["Дата", "Тип", "Описание", "Значение"];
      const rows: string[][] = [];

      // Add workouts
      if (workouts && workouts.length > 0) {
        rows.push(["", "", "", ""]);
        rows.push(["ТРЕНИРОВКИ", "", "", ""]);
        workouts.forEach((workout: any) => {
          rows.push([
            new Date(workout.date).toLocaleDateString("ru-RU"),
            "Тренировка",
            workout.notes || "Без описания",
            workout.duration ? `${workout.duration} мин` : "N/A",
          ]);
        });
      }

      // Add meals
      if (meals && meals.length > 0) {
        rows.push(["", "", "", ""]);
        rows.push(["ПИТАНИЕ", "", "", ""]);
        meals.forEach((meal: any) => {
          rows.push([
            new Date(meal.date).toLocaleDateString("ru-RU"),
            meal.mealType,
            meal.food?.name || "Unknown",
            `${meal.quantity}г`,
          ]);
        });
      }

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Download
      const element = document.createElement("a");
      element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
      element.setAttribute("download", `fitness-report-${new Date().toISOString().split("T")[0]}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Отчет экспортирован в CSV!");
    } catch (error) {
      toast.error("Ошибка при экспорте в CSV");
    }
  };

  const exportToPDF = () => {
    try {
      // Create PDF content
      let pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Отчет о прогрессе</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
    h2 { color: #1e3a8a; margin-top: 20px; }
    .section { margin: 20px 0; }
    .stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .stat-label { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
  </style>
</head>
<body>
  <h1>📊 Отчет о прогрессе фитнеса</h1>
  <p>Дата создания: ${new Date().toLocaleDateString("ru-RU")}</p>
  
  <div class="section">
    <h2>👤 Профиль</h2>
    <div class="stat">
      <span class="stat-label">Возраст:</span>
      <span>${profile?.age || "Не указан"}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Вес:</span>
      <span>${profile?.weight || "Не указан"} кг</span>
    </div>
    <div class="stat">
      <span class="stat-label">Рост:</span>
      <span>${profile?.height || "Не указан"} см</span>
    </div>
    <div class="stat">
      <span class="stat-label">Цель:</span>
      <span>${profile?.goal || "Не указана"}</span>
    </div>
  </div>

  <div class="section">
    <h2>💪 Тренировки (${workouts?.length || 0})</h2>
    ${
      workouts && workouts.length > 0
        ? `
    <table>
      <tr>
        <th>Дата</th>
        <th>Описание</th>
        <th>Длительность</th>
      </tr>
      ${workouts
        .map(
          (w: any) => `
      <tr>
        <td>${new Date(w.date).toLocaleDateString("ru-RU")}</td>
        <td>${w.notes || "Без описания"}</td>
        <td>${w.duration ? w.duration + " мин" : "N/A"}</td>
      </tr>
      `
        )
        .join("")}
    </table>
    `
        : "<p>Нет данных о тренировках</p>"
    }
  </div>

  <div class="section">
    <h2>🍎 Питание (${meals?.length || 0})</h2>
    ${
      meals && meals.length > 0
        ? `
    <table>
      <tr>
        <th>Дата</th>
        <th>Тип приема</th>
        <th>Продукт</th>
        <th>Количество</th>
      </tr>
      ${meals
        .map(
          (m: any) => `
      <tr>
        <td>${new Date(m.date).toLocaleDateString("ru-RU")}</td>
        <td>${m.mealType}</td>
        <td>${m.food?.name || "Unknown"}</td>
        <td>${m.quantity}г</td>
      </tr>
      `
        )
        .join("")}
    </table>
    `
        : "<p>Нет данных о питании</p>"
    }
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; font-size: 12px; color: #666;">
    <p>Этот отчет был автоматически создан приложением Fitness Tracker</p>
  </div>
</body>
</html>
      `;

      // Download
      const element = document.createElement("a");
      element.setAttribute("href", `data:text/html;charset=utf-8,${encodeURIComponent(pdfContent)}`);
      element.setAttribute("download", `fitness-report-${new Date().toISOString().split("T")[0]}.html`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Отчет экспортирован в HTML!");
    } catch (error) {
      toast.error("Ошибка при экспорте в HTML");
    }
  };

  return (
    <Card className="card-base p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Экспорт данных</h3>
        <p className="text-sm text-muted-foreground">
          Скачайте ваши данные о тренировках и питании в удобном формате
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={exportToCSV} className="w-full justify-start btn-primary">
            <Table className="mr-2 h-4 w-4" />
            Экспортировать в CSV
          </Button>
          <Button onClick={exportToPDF} className="w-full justify-start btn-primary">
            <FileText className="mr-2 h-4 w-4" />
            Экспортировать в HTML
          </Button>
        </div>
      </div>
    </Card>
  );
}
