import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import Landing from "@/pages/landing";
import Generate from "@/pages/generate";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/generate" component={Generate} />
      <Route path="/pricing" component={Pricing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { data: githubUser } = useQuery({
    queryKey: ["/api/github/user"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        githubConnected={!!githubUser} 
        githubUser={githubUser?.login}
      />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="repogen-ui-theme">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
