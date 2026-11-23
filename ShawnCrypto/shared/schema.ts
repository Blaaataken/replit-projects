import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  interestType: text("interest_type").notNull(),
  investmentAmount: text("investment_amount"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tokenMetrics = pgTable("token_metrics", {
  id: serial("id").primaryKey(),
  price: decimal("price", { precision: 10, scale: 6 }).notNull(),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }).notNull(),
  volume24h: decimal("volume_24h", { precision: 15, scale: 2 }).notNull(),
  holders: integer("holders").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  firstName: true,
  lastName: true,
  email: true,
  interestType: true,
  investmentAmount: true,
  message: true,
});

export const insertTokenMetricsSchema = createInsertSchema(tokenMetrics).pick({
  price: true,
  marketCap: true,
  volume24h: true,
  holders: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertTokenMetrics = z.infer<typeof insertTokenMetricsSchema>;
export type TokenMetrics = typeof tokenMetrics.$inferSelect;
