import {
  type Network,
  type InsertNetwork,
  type Portfolio,
  type InsertPortfolio,
  type TradingSignal,
  type InsertTradingSignal,
  type StakingPosition,
  type InsertStakingPosition,
  type Transaction,
  type InsertTransaction,
  type PriceData,
  type InsertPriceData,
  networks,
  portfolios,
  tradingSignals,
  stakingPositions,
  transactions,
  priceData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Networks
  getNetworks(): Promise<Network[]>;
  getNetwork(id: string): Promise<Network | undefined>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  updateNetwork(id: string, updates: Partial<Network>): Promise<Network | undefined>;

  // Portfolios
  getPortfolios(userId: string): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<Portfolio | undefined>;

  // Trading Signals
  getTradingSignals(): Promise<TradingSignal[]>;
  getLatestTradingSignals(limit: number): Promise<TradingSignal[]>;
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;

  // Staking Positions
  getStakingPositions(userId: string): Promise<StakingPosition[]>;
  createStakingPosition(position: InsertStakingPosition): Promise<StakingPosition>;
  updateStakingPosition(id: string, updates: Partial<StakingPosition>): Promise<StakingPosition | undefined>;

  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;

  // Price Data
  getPriceData(symbol: string): Promise<PriceData | undefined>;
  updatePriceData(price: InsertPriceData): Promise<PriceData>;
}

export class MemStorage implements IStorage {
  private networks: Map<string, Network>;
  private portfolios: Map<string, Portfolio>;
  private tradingSignals: Map<string, TradingSignal>;
  private stakingPositions: Map<string, StakingPosition>;
  private transactions: Map<string, Transaction>;
  private priceData: Map<string, PriceData>;

  constructor() {
    this.networks = new Map();
    this.portfolios = new Map();
    this.tradingSignals = new Map();
    this.stakingPositions = new Map();
    this.transactions = new Map();
    this.priceData = new Map();

    // Initialize with default networks
    this.initializeNetworks();
  }

  private initializeNetworks() {
    const defaultNetworks: Network[] = [
      {
        id: "eth",
        name: "Ethereum",
        symbol: "ETH",
        chainId: 1,
        rpcUrl: "https://eth.llamarpc.com",
        explorerUrl: "https://etherscan.io",
        gasPrice: "12.50",
        isActive: true,
      },
      {
        id: "bsc",
        name: "Binance Smart Chain",
        symbol: "BSC",
        chainId: 56,
        rpcUrl: "https://bsc-dataseed.binance.org",
        explorerUrl: "https://bscscan.com",
        gasPrice: "1.20",
        isActive: true,
      },
      {
        id: "polygon",
        name: "Polygon",
        symbol: "MATIC",
        chainId: 137,
        rpcUrl: "https://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com",
        gasPrice: "0.45",
        isActive: true,
      },
    ];

    defaultNetworks.forEach((network) => {
      this.networks.set(network.id, network);
    });
  }

  // Networks
  async getNetworks(): Promise<Network[]> {
    return Array.from(this.networks.values());
  }

  async getNetwork(id: string): Promise<Network | undefined> {
    return this.networks.get(id);
  }

  async createNetwork(insertNetwork: InsertNetwork): Promise<Network> {
    const id = randomUUID();
    const network: Network = {
      id,
      name: insertNetwork.name,
      symbol: insertNetwork.symbol,
      chainId: insertNetwork.chainId,
      rpcUrl: insertNetwork.rpcUrl,
      explorerUrl: insertNetwork.explorerUrl,
      gasPrice: insertNetwork.gasPrice ?? null,
      isActive: insertNetwork.isActive ?? true,
    };
    this.networks.set(id, network);
    return network;
  }

  async updateNetwork(id: string, updates: Partial<Network>): Promise<Network | undefined> {
    const network = this.networks.get(id);
    if (!network) return undefined;
    const updated = { ...network, ...updates };
    this.networks.set(id, updated);
    return updated;
  }

  // Portfolios
  async getPortfolios(userId: string): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter((p) => p.userId === userId);
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    const portfolio: Portfolio = {
      id,
      userId: insertPortfolio.userId,
      networkId: insertPortfolio.networkId,
      tokenSymbol: insertPortfolio.tokenSymbol,
      balance: insertPortfolio.balance,
      usdValue: insertPortfolio.usdValue ?? null,
      updatedAt: new Date(),
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;
    const updated = { ...portfolio, ...updates, updatedAt: new Date() };
    this.portfolios.set(id, updated);
    return updated;
  }

  // Trading Signals
  async getTradingSignals(): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values());
  }

  async getLatestTradingSignals(limit: number): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createTradingSignal(insertSignal: InsertTradingSignal): Promise<TradingSignal> {
    const id = randomUUID();
    const signal: TradingSignal = {
      id,
      symbol: insertSignal.symbol,
      action: insertSignal.action,
      confidence: insertSignal.confidence,
      targetPrice: insertSignal.targetPrice ?? null,
      reasoning: insertSignal.reasoning,
      createdAt: new Date(),
      expiresAt: insertSignal.expiresAt ?? null,
    };
    this.tradingSignals.set(id, signal);
    return signal;
  }

  // Staking Positions
  async getStakingPositions(userId: string): Promise<StakingPosition[]> {
    return Array.from(this.stakingPositions.values()).filter((p) => p.userId === userId);
  }

  async createStakingPosition(insertPosition: InsertStakingPosition): Promise<StakingPosition> {
    const id = randomUUID();
    const position: StakingPosition = {
      id,
      userId: insertPosition.userId,
      networkId: insertPosition.networkId,
      amount: insertPosition.amount,
      apy: insertPosition.apy,
      startDate: new Date(),
      endDate: insertPosition.endDate ?? null,
      rewardsEarned: insertPosition.rewardsEarned ?? "0",
    };
    this.stakingPositions.set(id, position);
    return position;
  }

  async updateStakingPosition(
    id: string,
    updates: Partial<StakingPosition>
  ): Promise<StakingPosition | undefined> {
    const position = this.stakingPositions.get(id);
    if (!position) return undefined;
    const updated = { ...position, ...updates };
    this.stakingPositions.set(id, updated);
    return updated;
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter((t) => t.userId === userId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      id,
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      fromNetwork: insertTransaction.fromNetwork ?? null,
      toNetwork: insertTransaction.toNetwork ?? null,
      amount: insertTransaction.amount,
      gasFee: insertTransaction.gasFee ?? null,
      status: insertTransaction.status,
      txHash: insertTransaction.txHash ?? null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  // Price Data
  async getPriceData(symbol: string): Promise<PriceData | undefined> {
    return this.priceData.get(symbol);
  }

  async updatePriceData(insertPrice: InsertPriceData): Promise<PriceData> {
    const id = randomUUID();
    const price: PriceData = {
      id,
      symbol: insertPrice.symbol,
      price: insertPrice.price,
      change24h: insertPrice.change24h ?? null,
      volume24h: insertPrice.volume24h ?? null,
      marketCap: insertPrice.marketCap ?? null,
      updatedAt: new Date(),
    };
    this.priceData.set(insertPrice.symbol, price);
    return price;
  }
}

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // Networks
  async getNetworks(): Promise<Network[]> {
    return await db.select().from(networks);
  }

  async getNetwork(id: string): Promise<Network | undefined> {
    const [network] = await db.select().from(networks).where(eq(networks.id, id));
    return network;
  }

  async createNetwork(insertNetwork: InsertNetwork): Promise<Network> {
    const [network] = await db.insert(networks).values(insertNetwork).returning();
    return network;
  }

  async updateNetwork(id: string, updates: Partial<Network>): Promise<Network | undefined> {
    const [network] = await db.update(networks).set(updates).where(eq(networks.id, id)).returning();
    return network;
  }

  // Portfolios
  async getPortfolios(userId: string): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db.insert(portfolios).values(insertPortfolio).returning();
    return portfolio;
  }

  async updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const [portfolio] = await db.update(portfolios).set(updates).where(eq(portfolios.id, id)).returning();
    return portfolio;
  }

  // Trading Signals
  async getTradingSignals(): Promise<TradingSignal[]> {
    return await db.select().from(tradingSignals);
  }

  async getLatestTradingSignals(limit: number): Promise<TradingSignal[]> {
    return await db.select().from(tradingSignals).orderBy(desc(tradingSignals.createdAt)).limit(limit);
  }

  async createTradingSignal(insertSignal: InsertTradingSignal): Promise<TradingSignal> {
    const [signal] = await db.insert(tradingSignals).values(insertSignal).returning();
    return signal;
  }

  // Staking Positions
  async getStakingPositions(userId: string): Promise<StakingPosition[]> {
    return await db.select().from(stakingPositions).where(eq(stakingPositions.userId, userId));
  }

  async createStakingPosition(insertPosition: InsertStakingPosition): Promise<StakingPosition> {
    const [position] = await db.insert(stakingPositions).values(insertPosition).returning();
    return position;
  }

  async updateStakingPosition(id: string, updates: Partial<StakingPosition>): Promise<StakingPosition | undefined> {
    const [position] = await db.update(stakingPositions).set(updates).where(eq(stakingPositions.id, id)).returning();
    return position;
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return transaction;
  }

  // Price Data
  async getPriceData(symbol: string): Promise<PriceData | undefined> {
    const [price] = await db.select().from(priceData).where(eq(priceData.symbol, symbol));
    return price;
  }

  async updatePriceData(insertPrice: InsertPriceData): Promise<PriceData> {
    const [price] = await db
      .insert(priceData)
      .values(insertPrice)
      .onConflictDoUpdate({
        target: priceData.symbol,
        set: insertPrice,
      })
      .returning();
    return price;
  }
}

export const storage = new DatabaseStorage();
