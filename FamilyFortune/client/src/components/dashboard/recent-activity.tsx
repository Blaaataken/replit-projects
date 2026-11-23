import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download, Star, Upload } from "lucide-react";

export default function RecentActivity() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = orders?.slice(0, 5) || [];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Download className="h-3 w-3 text-accent" />;
      case 'pending':
        return <Star className="h-3 w-3 text-yellow-500" />;
      default:
        return <Upload className="h-3 w-3 text-primary" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/10';
      case 'pending':
        return 'bg-yellow-100';
      default:
        return 'bg-primary/10';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="recent-activity-list">
          {recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">No recent activity</p>
            </div>
          ) : (
            recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-start space-x-3" data-testid={`activity-${order.id}`}>
                <div className={`w-8 h-8 ${getActivityColor(order.status)} rounded-full flex items-center justify-center`}>
                  {getActivityIcon(order.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {order.status === 'completed' && `${order.product?.name || 'Product'} downloaded`}
                    {order.status === 'pending' && `New order for ${order.product?.name || 'Product'}`}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-time-${order.id}`}>
                    {formatTimeAgo(order.createdAt)}
                  </p>
                </div>
                {order.status === 'completed' && (
                  <span className="text-sm font-medium text-accent" data-testid={`activity-amount-${order.id}`}>
                    +${order.amount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        
        <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80" data-testid="button-view-all-activity">
          View all activity
        </Button>
      </CardContent>
    </Card>
  );
}
