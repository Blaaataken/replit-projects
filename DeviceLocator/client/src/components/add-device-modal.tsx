import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Laptop, Monitor, HelpCircle } from "lucide-react";

const deviceSchema = z.object({
  name: z.string().min(1, "Device name is required").max(100, "Device name is too long"),
  type: z.enum(["smartphone", "tablet", "laptop", "desktop", "other"], {
    required_error: "Please select a device type",
  }),
  deviceId: z.string().min(1, "Device ID/IMEI is required").max(200, "Device ID is too long"),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const { toast } = useToast();

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      type: undefined,
      deviceId: "",
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: DeviceFormData) => {
      await apiRequest("POST", "/api/devices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Device registered successfully",
      });
      form.reset();
      onClose();
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
        description: "Failed to register device. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeviceFormData) => {
    createDeviceMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'laptop':
        return <Laptop className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-add-device">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Add a new device to your security monitoring system. Make sure to use the correct device identifier for tracking.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., John's iPhone, Work Laptop" 
                      {...field} 
                      data-testid="input-device-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-device-type">
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="smartphone" data-testid="option-smartphone">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>Smartphone</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tablet" data-testid="option-tablet">
                        <div className="flex items-center space-x-2">
                          <Tablet className="w-4 h-4" />
                          <span>Tablet</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="laptop" data-testid="option-laptop">
                        <div className="flex items-center space-x-2">
                          <Laptop className="w-4 h-4" />
                          <span>Laptop</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="desktop" data-testid="option-desktop">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4" />
                          <span>Desktop</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other" data-testid="option-other">
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="w-4 h-4" />
                          <span>Other</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID/IMEI/Serial Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter unique device identifier" 
                      {...field} 
                      data-testid="input-device-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createDeviceMutation.isPending}
                data-testid="button-cancel-device"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createDeviceMutation.isPending}
                data-testid="button-register-device"
              >
                {createDeviceMutation.isPending ? "Registering..." : "Register Device"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
