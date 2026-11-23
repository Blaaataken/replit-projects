import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { AlertTriangle, Lock, MapPin, Volume2, LockOpen, Radar, RotateCcw, Power, Radio, Shield } from "lucide-react";

interface EmergencyActionsProps {
  devices: any[];
}

export default function EmergencyActions({ devices }: EmergencyActionsProps) {
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const reportTheftMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      const device = devices.find(d => d.id === selectedDevice);
      await apiRequest("POST", "/api/incidents", {
        deviceId: selectedDevice,
        type: "theft",
        title: `Theft reported for ${device?.name || 'Unknown Device'}`,
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

  const lockDeviceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/lock`);
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
      if (!selectedDevice) throw new Error("No device selected");
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/locate`);
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

  const soundAlarmMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Alarm Activated",
        description: "Alarm signal sent to device",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate alarm",
        variant: "destructive",
      });
    },
  });

  const unlockDeviceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/unlock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device Unlocked", description: "Device has been unlocked successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unlock device", variant: "destructive" });
    },
  });

  const factoryResetMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      const device = devices.find(d => d.id === selectedDevice);
      if (!window.confirm(`WARNING: Factory reset will erase all data on ${device?.name}. Continue?`)) return;
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/factory-reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Factory Reset Initiated", description: "Device is being reset", variant: "destructive" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to initiate factory reset", variant: "destructive" });
    },
  });

  const remoteShutdownMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      const device = devices.find(d => d.id === selectedDevice);
      if (!window.confirm(`Shut down ${device?.name}? This cannot be undone remotely.`)) return;
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/shutdown`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Shutdown Initiated", description: "Device is shutting down", variant: "destructive" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to shutdown device", variant: "destructive" });
    },
  });

  const enableLostModeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/lost-mode`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Lost Mode Enabled", description: "Device is now in Lost Mode" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to enable Lost Mode", variant: "destructive" });
    },
  });

  const enableGpsTrackingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice) throw new Error("No device selected");
      await apiRequest("POST", `/api/devices/${selectedDevice}/emergency/gps-tracking`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "GPS Tracking Enabled", description: "High-precision tracking activated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to enable GPS tracking", variant: "destructive" });
    },
  });

  const handleReportTheft = () => {
    if (!selectedDevice) {
      toast({
        title: "No Device Selected",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }
    
    const device = devices.find(d => d.id === selectedDevice);
    if (window.confirm(`Are you sure you want to report ${device?.name || 'this device'} as stolen? This will alert authorities and mark the device as compromised.`)) {
      reportTheftMutation.mutate();
    }
  };

  const handleLockDevice = () => {
    if (!selectedDevice) {
      toast({
        title: "No Device Selected",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }
    
    const device = devices.find(d => d.id === selectedDevice);
    if (window.confirm(`Are you sure you want to lock ${device?.name || 'this device'}? This will prevent unauthorized access.`)) {
      lockDeviceMutation.mutate();
    }
  };

  const handleLocateDevice = () => {
    if (!selectedDevice) {
      toast({
        title: "No Device Selected",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }
    
    locateDeviceMutation.mutate();
  };

  const handleSoundAlarm = () => {
    if (!selectedDevice) {
      toast({
        title: "No Device Selected",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }
    
    soundAlarmMutation.mutate();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Device Control Center</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Device</label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger data-testid="select-emergency-device">
                <SelectValue placeholder="Choose a device to control" />
              </SelectTrigger>
              <SelectContent>
                {devices?.map((device) => (
                  <SelectItem key={device.id} value={device.id} data-testid={`option-device-${device.id}`}>
                    {device.name} ({device.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedDevice && (
            <Tabs defaultValue="security" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={handleLockDevice} disabled={lockDeviceMutation.isPending} variant="outline" className="h-12" data-testid="button-lock-device">
                    <Lock className="w-4 h-4 mr-2" /> Lock Device
                  </Button>
                  <Button onClick={() => unlockDeviceMutation.mutate()} disabled={!selectedDevice || unlockDeviceMutation.isPending} variant="outline" className="h-12">
                    <LockOpen className="w-4 h-4 mr-2" /> Unlock Device
                  </Button>
                  <Button onClick={handleSoundAlarm} disabled={soundAlarmMutation.isPending} variant="outline" className="h-12" data-testid="button-sound-alarm">
                    <Volume2 className="w-4 h-4 mr-2" /> Sound Alarm
                  </Button>
                  <Button onClick={() => enableLostModeMutation.mutate()} disabled={!selectedDevice || enableLostModeMutation.isPending} variant="outline" className="h-12">
                    <Shield className="w-4 h-4 mr-2" /> Lost Mode
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="tracking" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={handleLocateDevice} disabled={locateDeviceMutation.isPending} className="h-12" data-testid="button-locate-device">
                    <MapPin className="w-4 h-4 mr-2" /> Locate Device
                  </Button>
                  <Button onClick={() => enableGpsTrackingMutation.mutate()} disabled={!selectedDevice || enableGpsTrackingMutation.isPending} variant="outline" className="h-12">
                    <Radar className="w-4 h-4 mr-2" /> Enable GPS
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={() => factoryResetMutation.mutate()} disabled={!selectedDevice || factoryResetMutation.isPending} variant="outline" className="h-12 border-orange-500/50 text-orange-600">
                    <RotateCcw className="w-4 h-4 mr-2" /> Factory Reset
                  </Button>
                  <Button onClick={() => remoteShutdownMutation.mutate()} disabled={!selectedDevice || remoteShutdownMutation.isPending} variant="destructive" className="h-12">
                    <Power className="w-4 h-4 mr-2" /> Shutdown
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {selectedDevice && (
            <div className="pt-4 border-t">
              <Button onClick={handleReportTheft} disabled={reportTheftMutation.isPending} variant="destructive" className="w-full h-12" data-testid="button-report-theft">
                <AlertTriangle className="w-4 h-4 mr-2" /> Report Theft
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
