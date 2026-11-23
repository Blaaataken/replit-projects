import {
  users,
  trades,
  positions,
  portfolioHoldings,
  botSettings,
  marketData,
  type User,
  type InsertUser,
  type Trade,
  type InsertTrade,
  type Position,
  type InsertPosition,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type BotSettings,
  type InsertBotSettings,
  type MarketData,
  type InsertMarketData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trades
  getTrades(userId?: string): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;

  // Positions
  getPositions(userId?: string): Promise<Position[]>;
  getPosition(id: string): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined>;
  closePosition(id: string): Promise<Position | undefined>;

  // Portfolio Holdings
  getHoldings(userId?: string): Promise<PortfolioHolding[]>;
  getHolding(userId: string, symbol: string): Promise<PortfolioHolding | undefined>;
  createHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updateHolding(id: string, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined>;

  // Bot Settings
  getBotSettings(userId?: string): Promise<BotSettings | undefined>;
  createBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  updateBotSettings(id: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined>;

  // Market Data
  getMarketData(): Promise<MarketData[]>;
  upsertMarketData(data: InsertMarketData): Promise<MarketData>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Trades
  async getTrades(userId?: string): Promise<Trade[]> {
    if (userId) {
      return db.select().from(trades).where(eq(trades.userId, userId)).orderBy(desc(trades.executedAt));
    }
    return db.select().from(trades).orderBy(desc(trades.executedAt));
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
    return newTrade;
  }

  // Positions
  async getPositions(userId?: string): Promise<Position[]> {
    if (userId) {
      return db.select().from(positions).where(eq(positions.userId, userId)).orderBy(desc(positions.openedAt));
    }
    return db.select().from(positions).orderBy(desc(positions.openedAt));
  }

  async getPosition(id: string): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    return position || undefined;
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPosition] = await db.insert(positions).values(position).returning();
    return newPosition;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined> {
    const [updated] = await db.update(positions).set(updates).where(eq(positions.id, id)).returning();
    return updated || undefined;
  }

  async closePosition(id: string): Promise<Position | undefined> {
    const [closed] = await db
      .update(positions)
      .set({ status: "closed", closedAt: new Date() })
      .where(eq(positions.id, id))
      .returning();
    return closed || undefined;
  }

  // Portfolio Holdings
  async getHoldings(userId?: string): Promise<PortfolioHolding[]> {
    if (userId) {
      return db.select().from(portfolioHoldings).where(eq(portfolioHoldings.userId, userId));
    }
    return db.select().from(portfolioHoldings);
  }

  async getHolding(userId: string, symbol: string): Promise<PortfolioHolding | undefined> {
    const [holding] = await db
      .select()
      .from(portfolioHoldings)
      .where(and(eq(portfolioHoldings.userId, userId), eq(portfolioHoldings.symbol, symbol)));
    return holding || undefined;
  }

  async createHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [newHolding] = await db.insert(portfolioHoldings).values(holding).returning();
    return newHolding;
  }

  async updateHolding(id: string, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined> {
    const [updated] = await db.update(portfolioHoldings).set(updates).where(eq(portfolioHoldings.id, id)).returning();
    return updated || undefined;
  }

  // Bot Settings
  async getBotSettings(userId?: string): Promise<BotSettings | undefined> {
    if (userId) {
      const [settings] = await db.select().from(botSettings).where(eq(botSettings.userId, userId));
      return settings || undefined;
    }
    const [settings] = await db.select().from(botSettings);
    return settings || undefined;
  }

  async createBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    const [newSettings] = await db.insert(botSettings).values(settings).returning();
    return newSettings;
  }

  async updateBotSettings(id: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined> {
    const [updated] = await db.update(botSettings).set(updates).where(eq(botSettings.id, id)).returning();
    return updated || undefined;
  }

  // Market Data
  async getMarketData(): Promise<MarketData[]> {
    return db.select().from(marketData);
  }

  async upsertMarketData(data: InsertMarketData): Promise<MarketData> {
    const existing = await db.select().from(marketData).where(eq(marketData.symbol, data.symbol));
    if (existing.length > 0) {
      const [updated] = await db
        .update(marketData)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(marketData.symbol, data.symbol))
        .returning();
      return updated;
    }
    const [newData] = await db.insert(marketData).values(data).returning();
    return newData;
  }
}

export const storage = new DatabaseStorage();
