import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, boolean, decimal } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User usage tracking for generations and subscription status
export const userUsage = pgTable("user_usage", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  freeGenerationsUsed: integer("free_generations_used").default(0).notNull(),
  paidGenerationsRemaining: integer("paid_generations_remaining").default(0).notNull(),
  subscriptionStatus: varchar("subscription_status").default("none").notNull(), // none, active, cancelled
  subscriptionId: varchar("subscription_id"), // PayPal subscription ID
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;

// Payment history for both Stripe and PayPal
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider").notNull(), // stripe, paypal
  type: varchar("type").notNull(), // one_time, subscription
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD").notNull(),
  status: varchar("status").notNull(), // pending, completed, failed, refunded
  providerPaymentId: varchar("provider_payment_id"), // Stripe/PayPal transaction ID
  generationsGranted: integer("generations_granted").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Generation history log
export const generations = pgTable("generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectName: varchar("project_name").notNull(),
  projectDescription: varchar("project_description"),
  language: varchar("language").notNull(),
  framework: varchar("framework"),
  paymentType: varchar("payment_type").notNull(), // free, paid, subscription
  createdAt: timestamp("created_at").defaultNow(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;
