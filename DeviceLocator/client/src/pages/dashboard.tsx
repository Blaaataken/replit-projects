import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmergencyActions from "@/components/emergency-actions";
import { 
  Smartphone, 
  Wifi, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Shield,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalDevices: number;
    onlineDevices: number;
    alertCount: number;
    activeIncidents: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: devices, isLoading: devicesLoading } = useQuery<any[]>({
    queryKey: ["/api/devices"],
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activity"],
    retry: false,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
          <Wifi className="w-3 h-3 mr-1" />Online
        </Badge>;
      case 'offline':
        return <Badge variant="outline" className="text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />Offline
        </Badge>;
      case 'theft_alert':
        return <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" />Theft Alert
        </Badge>;
      case 'locked':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Locked
        </Badge>;
      case 'wiped':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
          Wiped
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'device_registered':
        return <Smartphone className="w-4 h-4 text-primary" />;
      case 'location_updated':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'device_locked':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'theft_reported':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Device Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage your registered devices</p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-devices">
                    {statsLoading ? "..." : stats?.totalDevices || 0}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Online Devices</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-online-devices">
                    {statsLoading ? "..." : stats?.onlineDevices || 0}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                  <Wifi className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="text-alert-count">
                    {statsLoading ? "..." : stats?.alertCount || 0}
                  </p>
                </div>
                <div className="bg-red-500/10 p-3 rounded-full">
                  <AlertTriangle className={`w-5 h-5 text-red-500 ${(stats?.alertCount || 0) > 0 ? 'animate-pulse' : ''}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-active-incidents">
                    {statsLoading ? "..." : stats?.activeIncidents || 0}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Actions */}
        <EmergencyActions devices={devices || []} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Devices */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Devices</CardTitle>
                  <Button asChild variant="outline" size="sm" data-testid="button-view-devices">
                    <Link href="/devices">
                      View All <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {devicesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : devices?.length === 0 ? (
                  <div className="text-center py-8">
                    <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No devices registered yet</p>
                    <Button asChild data-testid="button-add-first-device">
                      <Link href="/devices">Add Your First Device</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {devices?.slice(0, 5).map((device: any) => (
                      <div key={device.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors" data-testid={`device-card-${device.id}`}>
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Smartphone className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-device-name-${device.id}`}>{device.name}</p>
                            <p className="text-sm text-muted-foreground">{device.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(device.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {device.lastSeen ? formatTimeAgo(device.lastSeen) : 'Never'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : activities?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {activities?.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                        <div className="bg-muted/50 p-2 rounded-full">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.details || activity.action}</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : alerts?.length === 0 ? (
                  <div className="text-center py-4">
                    <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All devices secure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts?.slice(0, 3).map((alert: any) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border ${
                          alert.type === 'theft' ? 'bg-red-500/10 border-red-500/20' :
                          alert.type === 'device_locked' ? 'bg-yellow-500/10 border-yellow-500/20' :
                          'bg-blue-500/10 border-blue-500/20'
                        }`}
                        data-testid={`alert-${alert.id}`}
                      >
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                            alert.type === 'theft' ? 'text-red-500' :
                            alert.type === 'device_locked' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(alert.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
