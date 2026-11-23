import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Store from "@/pages/store";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/store" component={Store} />
          <Route path="/store/:id" component={Store} />
          <Route path="/checkout/:id" component={Checkout} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/store" component={Store} />
          <Route path="/store/:id" component={Store} />
          <Route path="/checkout/:id" component={Checkout} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
