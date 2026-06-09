import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "trainer" | "admin">("user");
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Ошибка регистрации");
        return;
      }

      const data = await response.json();
      if (data.success) {
        await utils.auth.me.invalidate();
        toast.success("Регистрация успешна!");
        setLocation("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">FitTracker</CardTitle>
          <CardDescription>Создать новый аккаунт</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Имя (опционально)
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium text-foreground"
              >
                Роль
              </label>
              <Select
                value={role}
                onValueChange={(value: any) => setRole(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">👤 Пользователь</SelectItem>
                  <SelectItem value="trainer">👨‍🏫 Тренер</SelectItem>
                  <SelectItem value="admin">👨‍💼 Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Подтвердить пароль
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
            >
              Войти
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
