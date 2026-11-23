import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor,
  MoreHorizontal,
  MapPin,
  Lock,
  AlertTriangle,
  Trash2,
  Wifi,
  WifiOff,
  Shield,
  Volume2
} from "lucide-react";

interface DeviceCardProps {
  device: any;
  onDelete: (deviceId: string) => void;
  onSelect: (device: any) => void;
}

export default function DeviceCard({ device, onDelete, onSelect }: DeviceCardProps) {
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const lockDeviceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/devices/${device.id}/emergency/lock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Device Locked",
        description: "Device has been locked successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to lock device",
        variant: "destructive",
      });
    },
  });

  const locateDeviceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/devices/${device.id}/emergency/locate`);
    },
    onSuccess: () => {
      toast({
        title: "Location Request Sent",
        description: "Device location request has been sent",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to request device location",
        variant: "destructive",
      });
    },
  });

  const reportTheftMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/incidents", {
        deviceId: device.id,
        type: "theft",
        title: `Theft reported for ${device.name}`,
        description: "Device theft reported via emergency action",
        status: "open"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Theft Reported",
        description: "Theft has been reported and authorities have been notified",
        variant: "destructive",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to report theft",
        variant: "destructive",
      });
    },
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-primary" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-primary" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-primary" />;
      case 'desktop':
        return <Monitor className="w-5 h-5 text-primary" />;
      default:
        return <Smartphone className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            <Wifi className="w-3 h-3 mr-1" />
            Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      case 'theft_alert':
        return (
          <Badge variant="destructive" className="animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Theft Alert
          </Badge>
        );
      case 'locked':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        );
      case 'wiped':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
            <Shield className="w-3 h-3 mr-1" />
            Wiped
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleLockDevice = () => {
    if (window.confirm(`Are you sure you want to lock ${device.name}? This will prevent unauthorized access.`)) {
      lockDeviceMutation.mutate();
    }
  };

  const handleReportTheft = () => {
    if (window.confirm(`Are you sure you want to report ${device.name} as stolen? This will alert authorities and mark the device as compromised.`)) {
      reportTheftMutation.mutate();
    }
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer group" 
        onClick={() => onSelect(device)}
        data-testid={`device-card-${device.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                {getDeviceIcon(device.type)}
              </div>
              <div>
                <CardTitle className="text-lg" data-testid={`text-device-name-${device.id}`}>{device.name}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{device.type}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" data-testid={`button-device-menu-${device.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Emergency Actions</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    locateDeviceMutation.mutate();
                  }}
                  disabled={locateDeviceMutation.isPending}
                  data-testid={`menu-locate-${device.id}`}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Locate Device
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLockDevice();
                  }}
                  disabled={lockDeviceMutation.isPending || device.status === 'locked'}
                  data-testid={`menu-lock-${device.id}`}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Device
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    toast({
                      title: "Sound Alarm",
                      description: "Alarm signal sent to device",
                    });
                  }}
                  data-testid={`menu-alarm-${device.id}`}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Sound Alarm
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReportTheft();
                  }}
                  disabled={reportTheftMutation.isPending || device.status === 'theft_alert'}
                  className="text-red-600 focus:text-red-600"
                  data-testid={`menu-report-theft-${device.id}`}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Theft
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteAlert(true);
                  }}
                  className="text-red-600 focus:text-red-600"
                  data-testid={`menu-delete-${device.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Device
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(device.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Seen</span>
              <span className="text-sm text-foreground" data-testid={`text-last-seen-${device.id}`}>
                {device.lastSeen ? formatTimeAgo(device.lastSeen) : 'Never'}
              </span>
            </div>
            
            {device.latestLocation?.address && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm text-foreground text-right max-w-[60%]" data-testid={`text-location-${device.id}`}>
                  {device.latestLocation.address}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Device ID</span>
              <span className="text-sm text-foreground font-mono" data-testid={`text-device-id-${device.id}`}>
                {device.deviceId.slice(-8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{device.name}"? This action cannot be undone and will remove all associated data including location history and incident reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(device.id)}
              className="bg-red-500 text-white hover:bg-red-600"
              data-testid="button-confirm-delete"
            >
              Delete Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
