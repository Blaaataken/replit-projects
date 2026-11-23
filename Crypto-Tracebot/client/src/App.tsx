import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppHeader } from "@/components/app-header";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import type { BotSettings } from "@shared/schema";

function AppContent() {
  const { data: botSettings } = useQuery<BotSettings | null>({
    queryKey: ["/api/bot/settings"],
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader botActive={botSettings?.isActive || false} />
      <main>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
