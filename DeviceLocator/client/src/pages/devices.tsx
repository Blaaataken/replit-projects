import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import DeviceCard from "@/components/device-card";
import AddDeviceModal from "@/components/add-device-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor,
  MoreHorizontal,
  Shield
} from "lucide-react";

export default function Devices() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

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

  const { data: devices, isLoading: devicesLoading, error } = useQuery<any[]>({
    queryKey: ["/api/devices"],
    retry: false,
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await apiRequest("DELETE", `/api/devices/${deviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Device deleted successfully",
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
        description: "Failed to delete device",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading devices...</p>
        </div>
      </div>
    );
  }

  const handleDeleteDevice = (deviceId: string) => {
    if (window.confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
      deleteDeviceMutation.mutate(deviceId);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>;
      case 'offline':
        return <Badge variant="outline" className="text-muted-foreground">Offline</Badge>;
      case 'theft_alert':
        return <Badge variant="destructive" className="animate-pulse">Theft Alert</Badge>;
      case 'locked':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Locked</Badge>;
      case 'wiped':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">Wiped</Badge>;
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

  const filteredDevices = devices?.filter((device: any) =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error && isUnauthorizedError(error)) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Device Management</h2>
            <p className="text-muted-foreground">Monitor and control all your registered devices</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0"
            data-testid="button-add-device"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-devices"
            />
          </div>
        </div>

        {/* Devices Grid */}
        {devicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDevices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Smartphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {devices?.length === 0 ? "No devices registered" : "No devices found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {devices?.length === 0 
                  ? "Get started by adding your first device to the security platform." 
                  : "Try adjusting your search terms or add a new device."}
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                data-testid="button-add-first-device"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device: any) => (
              <DeviceCard
                key={device.id}
                device={device}
                onDelete={handleDeleteDevice}
                onSelect={setSelectedDevice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
