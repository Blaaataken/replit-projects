import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import RevenueCards from "@/components/dashboard/revenue-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import ProductsSection from "@/components/dashboard/products-section";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: !!user,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-foreground mb-6" data-testid="heading-dashboard">
              Dashboard
            </h1>
            
            <RevenueCards 
              analytics={analytics} 
              isLoading={analyticsLoading} 
            />
            
            <QuickActions />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <RecentActivity />
              
              <div className="lg:col-span-2">
                <ProductsSection 
                  products={products || []} 
                  isLoading={productsLoading} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
