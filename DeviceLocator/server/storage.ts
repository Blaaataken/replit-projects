import {
  users,
  devices,
  deviceLocations,
  incidents,
  activityLog,
  alerts,
  type User,
  type UpsertUser,
  type Device,
  type InsertDevice,
  type DeviceLocation,
  type InsertDeviceLocation,
  type Incident,
  type InsertIncident,
  type ActivityLog,
  type InsertActivityLog,
  type Alert,
  type InsertAlert,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Device operations
  createDevice(device: InsertDevice): Promise<Device>;
  getDevicesByUserId(userId: string): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  updateDeviceStatus(deviceId: string, status: Device['status']): Promise<void>;
  updateDeviceLastSeen(deviceId: string): Promise<void>;
  deleteDevice(deviceId: string): Promise<void>;
  
  // Device location operations
  addDeviceLocation(location: InsertDeviceLocation): Promise<DeviceLocation>;
  getLatestDeviceLocation(deviceId: string): Promise<DeviceLocation | undefined>;
  getDeviceLocationHistory(deviceId: string, limit?: number): Promise<DeviceLocation[]>;
  
  // Incident operations
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncidentsByUserId(userId: string): Promise<Incident[]>;
  getIncidentsByDeviceId(deviceId: string): Promise<Incident[]>;
  updateIncidentStatus(incidentId: string, status: Incident['status']): Promise<void>;
  
  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityByUserId(userId: string, limit?: number): Promise<ActivityLog[]>;
  getActivityByDeviceId(deviceId: string, limit?: number): Promise<ActivityLog[]>;
  
  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlertsByUserId(userId: string, limit?: number): Promise<Alert[]>;
  markAlertAsRead(alertId: string): Promise<void>;
  getUnreadAlertCount(userId: string): Promise<number>;
  
  // Dashboard statistics
  getUserDeviceStats(userId: string): Promise<{
    totalDevices: number;
    onlineDevices: number;
    alertCount: number;
    activeIncidents: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Device operations
  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db.insert(devices).values(device).returning();
    
    // Log the device registration activity
    await this.logActivity({
      deviceId: newDevice.id,
      userId: device.userId,
      action: 'device_registered',
      details: `Device "${device.name}" was registered`,
    });
    
    return newDevice;
  }

  async getDevicesByUserId(userId: string): Promise<Device[]> {
    return await db.select().from(devices).where(eq(devices.userId, userId)).orderBy(desc(devices.createdAt));
  }

  async getDevice(id: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async updateDeviceStatus(deviceId: string, status: Device['status']): Promise<void> {
    await db.update(devices)
      .set({ status, updatedAt: new Date() })
      .where(eq(devices.id, deviceId));
  }

  async updateDeviceLastSeen(deviceId: string): Promise<void> {
    await db.update(devices)
      .set({ lastSeen: new Date(), updatedAt: new Date() })
      .where(eq(devices.id, deviceId));
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await db.delete(devices).where(eq(devices.id, deviceId));
  }

  // Device location operations
  async addDeviceLocation(location: InsertDeviceLocation): Promise<DeviceLocation> {
    const [newLocation] = await db.insert(deviceLocations).values(location).returning();
    
    // Update device last seen
    await this.updateDeviceLastSeen(location.deviceId);
    
    // Log location update activity
    await this.logActivity({
      deviceId: location.deviceId,
      action: 'location_updated',
      details: location.address ? `Location updated: ${location.address}` : 'Location updated',
    });
    
    return newLocation;
  }

  async getLatestDeviceLocation(deviceId: string): Promise<DeviceLocation | undefined> {
    const [location] = await db.select()
      .from(deviceLocations)
      .where(eq(deviceLocations.deviceId, deviceId))
      .orderBy(desc(deviceLocations.timestamp))
      .limit(1);
    return location;
  }

  async getDeviceLocationHistory(deviceId: string, limit: number = 50): Promise<DeviceLocation[]> {
    return await db.select()
      .from(deviceLocations)
      .where(eq(deviceLocations.deviceId, deviceId))
      .orderBy(desc(deviceLocations.timestamp))
      .limit(limit);
  }

  // Incident operations
  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    
    // Update device status to theft_alert if it's a theft incident
    if (incident.type === 'theft') {
      await this.updateDeviceStatus(incident.deviceId, 'theft_alert');
    }
    
    // Create alert
    await this.createAlert({
      userId: incident.userId,
      deviceId: incident.deviceId,
      type: incident.type,
      message: `${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} incident reported: ${incident.title}`,
    });
    
    // Log incident activity
    await this.logActivity({
      deviceId: incident.deviceId,
      userId: incident.userId,
      action: 'incident_reported',
      details: `${incident.type} incident reported: ${incident.title}`,
    });
    
    return newIncident;
  }

  async getIncidentsByUserId(userId: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.userId, userId)).orderBy(desc(incidents.createdAt));
  }

  async getIncidentsByDeviceId(deviceId: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.deviceId, deviceId)).orderBy(desc(incidents.createdAt));
  }

  async updateIncidentStatus(incidentId: string, status: Incident['status']): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }
    
    await db.update(incidents)
      .set(updateData)
      .where(eq(incidents.id, incidentId));
  }

  // Activity log operations
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLog).values(activity).returning();
    return newActivity;
  }

  async getActivityByUserId(userId: string, limit: number = 50): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.timestamp))
      .limit(limit);
  }

  async getActivityByDeviceId(deviceId: string, limit: number = 50): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLog)
      .where(eq(activityLog.deviceId, deviceId))
      .orderBy(desc(activityLog.timestamp))
      .limit(limit);
  }

  // Alert operations
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async getAlertsByUserId(userId: string, limit: number = 50): Promise<Alert[]> {
    return await db.select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt))
      .limit(limit);
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await db.update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, alertId));
  }

  async getUnreadAlertCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(alerts)
      .where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)));
    return result.count;
  }

  // Dashboard statistics
  async getUserDeviceStats(userId: string): Promise<{
    totalDevices: number;
    onlineDevices: number;
    alertCount: number;
    activeIncidents: number;
  }> {
    const [deviceStats] = await db
      .select({
        totalDevices: count(),
        onlineDevices: count(sql`CASE WHEN ${devices.status} = 'online' THEN 1 END`),
      })
      .from(devices)
      .where(eq(devices.userId, userId));

    const [alertCount] = await db
      .select({ count: count() })
      .from(alerts)
      .where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)));

    const [incidentCount] = await db
      .select({ count: count() })
      .from(incidents)
      .where(and(eq(incidents.userId, userId), or(eq(incidents.status, 'open'), eq(incidents.status, 'investigating'))));

    return {
      totalDevices: deviceStats.totalDevices,
      onlineDevices: deviceStats.onlineDevices,
      alertCount: alertCount.count,
      activeIncidents: incidentCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
