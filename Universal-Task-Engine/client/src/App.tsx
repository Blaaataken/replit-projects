import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatPage } from "@/pages/Chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <Router />
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
