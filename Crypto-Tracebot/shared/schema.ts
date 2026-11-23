import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Portfolio holdings
export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  averageBuyPrice: numeric("average_buy_price", { precision: 20, scale: 8 }).notNull(),
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
});

export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;

// Trade history
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'buy' | 'sell'
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  price: numeric("price", { precision: 20, scale: 8 }).notNull(),
  total: numeric("total", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull().default("completed"), // 'pending' | 'completed' | 'failed'
  isBot: boolean("is_bot").notNull().default(false),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  executedAt: true,
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// Bot settings
export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(false),
  tradingPairs: text("trading_pairs").array().notNull().default(sql`ARRAY['BTC/USDT', 'ETH/USDT']::text[]`),
  profitTarget: numeric("profit_target", { precision: 5, scale: 2 }).notNull().default("10.00"),
  stopLoss: numeric("stop_loss", { precision: 5, scale: 2 }).notNull().default("15.00"),
  maxTradeAmount: numeric("max_trade_amount", { precision: 20, scale: 8 }).notNull().default("1000.00"),
  strategy: text("strategy").notNull().default("aggressive"),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;

// Active positions (for tracking open trades)
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  entryPrice: numeric("entry_price", { precision: 20, scale: 8 }).notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  targetPrice: numeric("target_price", { precision: 20, scale: 8 }).notNull(),
  stopLossPrice: numeric("stop_loss_price", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull().default("open"), // 'open' | 'closed' | 'stopped'
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  openedAt: true,
  closedAt: true,
});

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

// Market data cache (for storing recent price data)
export const marketData = pgTable("market_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  price: numeric("price", { precision: 20, scale: 8 }).notNull(),
  change24h: numeric("change_24h", { precision: 10, scale: 2 }).notNull(),
  volume24h: numeric("volume_24h", { precision: 30, scale: 2 }).notNull(),
  marketCap: numeric("market_cap", { precision: 30, scale: 2 }),
  high24h: numeric("high_24h", { precision: 20, scale: 8 }),
  low24h: numeric("low_24h", { precision: 20, scale: 8 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  updatedAt: true,
});

export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type MarketData = typeof marketData.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  portfolioHoldings: many(portfolioHoldings),
  trades: many(trades),
  positions: many(positions),
  botSettings: one(botSettings),
}));

export const portfolioHoldingsRelations = relations(portfolioHoldings, ({ one }) => ({
  user: one(users, {
    fields: [portfolioHoldings.userId],
    references: [users.id],
  }),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  user: one(users, {
    fields: [positions.userId],
    references: [users.id],
  }),
}));

export const botSettingsRelations = relations(botSettings, ({ one }) => ({
  user: one(users, {
    fields: [botSettings.userId],
    references: [users.id],
  }),
}));

// Frontend types for market data (not persisted, used for real-time updates)
export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  sparkline?: number[];
}

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AIInsight {
  id: string;
  symbol: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  timestamp: Date;
}
