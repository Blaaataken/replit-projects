import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDeviceSchema, insertIncidentSchema, insertDeviceLocationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Device routes
  app.get('/api/devices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getDevicesByUserId(userId);
      
      // Get latest location for each device
      const devicesWithLocation = await Promise.all(
        devices.map(async (device) => {
          const location = await storage.getLatestDeviceLocation(device.id);
          return { ...device, latestLocation: location };
        })
      );
      
      res.json(devicesWithLocation);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post('/api/devices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceData = insertDeviceSchema.parse({ ...req.body, userId });
      
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.get('/api/devices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      // Check if user owns this device
      if (device.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const location = await storage.getLatestDeviceLocation(deviceId);
      res.json({ ...device, latestLocation: location });
    } catch (error) {
      console.error("Error fetching device:", error);
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.put('/api/devices/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const { status } = req.body;
      
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      await storage.updateDeviceStatus(deviceId, status);
      
      // Log the status change
      await storage.logActivity({
        deviceId,
        userId: req.user.claims.sub,
        action: 'status_changed',
        details: `Device status changed to ${status}`,
      });
      
      res.json({ message: "Device status updated" });
    } catch (error) {
      console.error("Error updating device status:", error);
      res.status(500).json({ message: "Failed to update device status" });
    }
  });

  app.delete('/api/devices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      await storage.deleteDevice(deviceId);
      res.json({ message: "Device deleted" });
    } catch (error) {
      console.error("Error deleting device:", error);
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Device location routes
  app.post('/api/devices/:id/location', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const locationData = insertDeviceLocationSchema.parse({ ...req.body, deviceId });
      const location = await storage.addDeviceLocation(locationData);
      
      res.status(201).json(location);
    } catch (error) {
      console.error("Error adding device location:", error);
      res.status(500).json({ message: "Failed to add device location" });
    }
  });

  app.get('/api/devices/:id/locations', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const locations = await storage.getDeviceLocationHistory(deviceId, limit);
      
      res.json(locations);
    } catch (error) {
      console.error("Error fetching device locations:", error);
      res.status(500).json({ message: "Failed to fetch device locations" });
    }
  });

  // Incident routes
  app.post('/api/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const incidentData = insertIncidentSchema.parse({ ...req.body, userId });
      
      const incident = await storage.createIncident(incidentData);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  app.get('/api/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const incidents = await storage.getIncidentsByUserId(userId);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.put('/api/incidents/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const incidentId = req.params.id;
      const { status } = req.body;
      
      await storage.updateIncidentStatus(incidentId, status);
      
      res.json({ message: "Incident status updated" });
    } catch (error) {
      console.error("Error updating incident status:", error);
      res.status(500).json({ message: "Failed to update incident status" });
    }
  });

  // Activity routes
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivityByUserId(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const alerts = await storage.getAlertsByUserId(userId, limit);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.put('/api/alerts/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const alertId = req.params.id;
      await storage.markAlertAsRead(alertId);
      res.json({ message: "Alert marked as read" });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserDeviceStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Emergency action routes
  app.post('/api/devices/:id/emergency/lock', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      await storage.updateDeviceStatus(deviceId, 'locked');
      
      await storage.logActivity({
        deviceId,
        userId: req.user.claims.sub,
        action: 'device_locked',
        details: 'Device locked via emergency action',
      });
      
      await storage.createAlert({
        userId: req.user.claims.sub,
        deviceId,
        type: 'device_locked',
        message: `Device "${device.name}" has been locked`,
      });
      
      res.json({ message: "Device locked successfully" });
    } catch (error) {
      console.error("Error locking device:", error);
      res.status(500).json({ message: "Failed to lock device" });
    }
  });

  app.post('/api/devices/:id/emergency/wipe', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      await storage.updateDeviceStatus(deviceId, 'wiped');
      
      await storage.logActivity({
        deviceId,
        userId: req.user.claims.sub,
        action: 'device_wiped',
        details: 'Device wiped via emergency action',
      });
      
      await storage.createAlert({
        userId: req.user.claims.sub,
        deviceId,
        type: 'device_wiped',
        message: `Device "${device.name}" has been wiped`,
      });
      
      res.json({ message: "Device wipe initiated successfully" });
    } catch (error) {
      console.error("Error wiping device:", error);
      res.status(500).json({ message: "Failed to wipe device" });
    }
  });

  app.post('/api/devices/:id/emergency/locate', isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = req.params.id;
      const device = await storage.getDevice(deviceId);
      
      if (!device || device.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const location = await storage.getLatestDeviceLocation(deviceId);
      
      await storage.logActivity({
        deviceId,
        userId: req.user.claims.sub,
        action: 'location_requested',
        details: 'Location requested via emergency action',
      });
      
      res.json({ location, message: "Location request sent to device" });
    } catch (error) {
      console.error("Error requesting device location:", error);
      res.status(500).json({ message: "Failed to request device location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
