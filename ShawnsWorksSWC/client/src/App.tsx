import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Trading from "@/pages/trading";
import Bridge from "@/pages/bridge";
import Staking from "@/pages/staking";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/trading" component={Trading} />
      <Route path="/bridge" component={Bridge} />
      <Route path="/staking" component={Staking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <Web3Provider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </Web3Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
