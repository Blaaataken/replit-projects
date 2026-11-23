import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Network types
export const networks = pgTable("networks", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  chainId: integer("chain_id").notNull(),
  rpcUrl: text("rpc_url").notNull(),
  explorerUrl: text("explorer_url").notNull(),
  gasPrice: decimal("gas_price", { precision: 20, scale: 8 }),
  isActive: boolean("is_active").default(true),
});

// Portfolio positions
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  networkId: varchar("network_id").notNull().references(() => networks.id),
  tokenSymbol: text("token_symbol").notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).notNull(),
  usdValue: decimal("usd_value", { precision: 20, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading signals
export const tradingSignals = pgTable("trading_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  action: text("action").notNull(), // buy, sell, hold
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }),
  reasoning: text("reasoning").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Staking positions
export const stakingPositions = pgTable("staking_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  networkId: varchar("network_id").notNull().references(() => networks.id),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  rewardsEarned: decimal("rewards_earned", { precision: 20, scale: 8 }).default("0"),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // trade, bridge, stake, unstake
  fromNetwork: varchar("from_network"),
  toNetwork: varchar("to_network"),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  gasFee: decimal("gas_fee", { precision: 20, scale: 8 }),
  status: text("status").notNull(), // pending, completed, failed
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Price data
export const priceData = pgTable("price_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  change24h: decimal("change_24h", { precision: 5, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertNetworkSchema = createInsertSchema(networks).omit({ id: true });
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true, updatedAt: true });
export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({ id: true, createdAt: true });
export const insertStakingPositionSchema = createInsertSchema(stakingPositions).omit({ id: true, startDate: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertPriceDataSchema = createInsertSchema(priceData).omit({ id: true, updatedAt: true });

// Types
export type Network = typeof networks.$inferSelect;
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type PriceData = typeof priceData.$inferSelect;
export type InsertPriceData = z.infer<typeof insertPriceDataSchema>;
