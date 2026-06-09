import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Exercises from "./pages/Exercises";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Appointments from "./pages/Appointments";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "./_core/hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Загрузка...</div>;
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/nutrition" component={Nutrition} />
        <Route path="/appointments" component={Appointments} />
        {user.role === "admin" && <Route path="/admin" component={AdminPanel} />}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
