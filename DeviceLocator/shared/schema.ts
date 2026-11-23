import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device types enum
export const deviceTypeEnum = pgEnum('device_type', [
  'smartphone',
  'tablet', 
  'laptop',
  'desktop',
  'other'
]);

// Device status enum
export const deviceStatusEnum = pgEnum('device_status', [
  'online',
  'offline',
  'theft_alert',
  'locked',
  'wiped'
]);

// Devices table
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: deviceTypeEnum("type").notNull(),
  deviceId: text("device_id").notNull(), // IMEI, serial number, etc.
  status: deviceStatusEnum("status").notNull().default('offline'),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device locations table for tracking
export const deviceLocations = pgTable("device_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id, { onDelete: 'cascade' }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  address: text("address"),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }), // in meters
  timestamp: timestamp("timestamp").defaultNow(),
});

// Incident types enum
export const incidentTypeEnum = pgEnum('incident_type', [
  'theft',
  'lost',
  'suspicious_activity',
  'unauthorized_access'
]);

// Incident status enum
export const incidentStatusEnum = pgEnum('incident_status', [
  'open',
  'investigating',
  'resolved',
  'closed'
]);

// Security incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: incidentTypeEnum("type").notNull(),
  status: incidentStatusEnum("status").notNull().default('open'),
  title: text("title").notNull(),
  description: text("description"),
  reportedAt: timestamp("reported_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log for device actions
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  action: text("action").notNull(), // 'check_in', 'location_update', 'lock', 'wipe', etc.
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Alert notifications table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceId: varchar("device_id").references(() => devices.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'theft', 'offline', 'location_change', etc.
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
  incidents: many(incidents),
  activityLog: many(activityLog),
  alerts: many(alerts),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
  locations: many(deviceLocations),
  incidents: many(incidents),
  activityLog: many(activityLog),
  alerts: many(alerts),
}));

export const deviceLocationsRelations = relations(deviceLocations, ({ one }) => ({
  device: one(devices, {
    fields: [deviceLocations.deviceId],
    references: [devices.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  device: one(devices, {
    fields: [incidents.deviceId],
    references: [devices.id],
  }),
  user: one(users, {
    fields: [incidents.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  device: one(devices, {
    fields: [activityLog.deviceId],
    references: [devices.id],
  }),
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
}));

// Insert schemas
export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reportedAt: true,
});

export const insertDeviceLocationSchema = createInsertSchema(deviceLocations).omit({
  id: true,
  timestamp: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type DeviceLocation = typeof deviceLocations.$inferSelect;
export type InsertDeviceLocation = z.infer<typeof insertDeviceLocationSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
