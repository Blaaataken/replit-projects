import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTradingSignal, optimizeGasFees } from "./ai";
import {
  insertPortfolioSchema,
  insertStakingPositionSchema,
  insertTransactionSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user ID for MVP
  const DEMO_USER_ID = "demo-user";

  // Initialize demo data
  await initializeDemoData(DEMO_USER_ID);

  // Networks
  app.get("/api/networks", async (req, res) => {
    try {
      const networks = await storage.getNetworks();
      res.json(networks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch networks" });
    }
  });

  app.get("/api/networks/:id", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.json(network);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network" });
    }
  });

  // Portfolios
  app.get("/api/portfolios", async (req, res) => {
    try {
      const portfolios = await storage.getPortfolios(DEMO_USER_ID);
      
      // Enrich with network data
      const enriched = await Promise.all(
        portfolios.map(async (portfolio) => {
          const network = await storage.getNetwork(portfolio.networkId);
          return { ...portfolio, network };
        })
      );
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.post("/api/portfolios", async (req, res) => {
    try {
      const data = insertPortfolioSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const portfolio = await storage.createPortfolio(data);
      res.json(portfolio);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const portfolios = await storage.getPortfolios(DEMO_USER_ID);
      const stakingPositions = await storage.getStakingPositions(DEMO_USER_ID);

      const totalBalance = portfolios.reduce(
        (sum, p) => sum + parseFloat(p.usdValue || "0"),
        0
      );

      const rewardsEarned = stakingPositions.reduce(
        (sum, p) => sum + parseFloat(p.rewardsEarned || "0"),
        0
      );

      const stats = {
        totalBalance,
        balanceChange: 12.5,
        activeNetworks: new Set(portfolios.map((p) => p.networkId)).size,
        rewardsEarned,
        rewardsChange: 8.3,
        gasSaved: 342.15,
        gasSavedChange: 15.2,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Trading Signals
  app.get("/api/trading/signals", async (req, res) => {
    try {
      const signals = await storage.getLatestTradingSignals(10);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trading signals" });
    }
  });

  app.post("/api/trading/signals/generate", async (req, res) => {
    try {
      const { symbol, currentPrice, volume24h, change24h } = req.body;

      if (!symbol || !currentPrice) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const aiSignal = await generateTradingSignal({
        symbol,
        currentPrice,
        volume24h,
        change24h,
      });

      const signal = await storage.createTradingSignal({
        symbol,
        action: aiSignal.action,
        confidence: aiSignal.confidence.toString(),
        targetPrice: aiSignal.targetPrice,
        reasoning: aiSignal.reasoning,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      res.json(signal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trading Performance
  app.get("/api/trading/performance", async (req, res) => {
    try {
      const performance = {
        totalTrades: 247,
        successRate: 68.4,
        totalProfit: 5847.23,
        profitChange: 24.5,
        avgTradeTime: "2.4h",
      };
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance" });
    }
  });

  // Gas Optimization
  app.post("/api/gas/optimize", async (req, res) => {
    try {
      const { fromNetwork, toNetwork, amount } = req.body;

      if (!fromNetwork || !toNetwork || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const optimization = await optimizeGasFees({
        fromNetwork,
        toNetwork,
        amount,
      });

      res.json(optimization);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Staking Positions
  app.get("/api/staking/positions", async (req, res) => {
    try {
      const positions = await storage.getStakingPositions(DEMO_USER_ID);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staking positions" });
    }
  });

  app.post("/api/staking/positions", async (req, res) => {
    try {
      const data = insertStakingPositionSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const position = await storage.createStakingPosition(data);
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(DEMO_USER_ID);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const transaction = await storage.createTransaction(data);
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Price Data - Single Symbol
  app.get("/api/prices/:symbol", async (req, res) => {
    try {
      const price = await storage.getPriceData(req.params.symbol);
      if (!price) {
        return res.status(404).json({ error: "Price data not found" });
      }
      res.json(price);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price data" });
    }
  });

  // Real-Time Price Aggregator - Multiple Tokens
  app.get("/api/prices", async (req, res) => {
    try {
      const defaultPrices = [
        { symbol: "ETH", name: "Ethereum", price: "1876.42", change24h: "2.34", volume24h: "12500000000", marketCap: "225000000000" },
        { symbol: "BNB", name: "Binance Coin", price: "337.15", change24h: "-0.87", volume24h: "890000000", marketCap: "51800000000" },
        { symbol: "MATIC", name: "Polygon", price: "0.5698", change24h: "5.21", volume24h: "342000000", marketCap: "5300000000" },
        { symbol: "BTC", name: "Bitcoin", price: "42567.89", change24h: "1.45", volume24h: "28000000000", marketCap: "833000000000" },
        { symbol: "SOL", name: "Solana", price: "98.45", change24h: "3.67", volume24h: "2100000000", marketCap: "42000000000" },
        { symbol: "AVAX", name: "Avalanche", price: "35.78", change24h: "-1.23", volume24h: "456000000", marketCap: "13200000000" },
        { symbol: "ARB", name: "Arbitrum", price: "1.12", change24h: "4.56", volume24h: "234000000", marketCap: "3500000000" },
        { symbol: "OP", name: "Optimism", price: "2.87", change24h: "2.89", volume24h: "187000000", marketCap: "2800000000" },
        { symbol: "SWC", name: "SHAWNSWORKS", price: "0.0247", change24h: "12.45", volume24h: "5400000", marketCap: "24700000" },
      ];

      const pricesWithId = defaultPrices.map((p, idx) => ({
        id: `price-${idx}`,
        ...p,
        updatedAt: new Date().toISOString(),
      }));

      res.json(pricesWithId);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  // Bridge Routes Endpoint
  app.get("/api/bridge/routes", async (req, res) => {
    try {
      const { fromNetwork, toNetwork, amount } = req.query;
      
      const routes = [
        { 
          network: fromNetwork || "Ethereum", 
          fee: "12.50", 
          time: "5-10 min", 
          optimal: false,
          estimatedReceive: amount ? (parseFloat(amount as string) * 0.999).toFixed(4) : "0"
        },
        { 
          network: "Polygon", 
          fee: "0.45", 
          time: "2-3 min", 
          optimal: true,
          estimatedReceive: amount ? (parseFloat(amount as string) * 0.9995).toFixed(4) : "0"
        },
        { 
          network: "Arbitrum", 
          fee: "2.30", 
          time: "3-5 min", 
          optimal: false,
          estimatedReceive: amount ? (parseFloat(amount as string) * 0.998).toFixed(4) : "0"
        },
      ];

      res.json({
        routes,
        gasEstimate: "0.45",
        bridgeFee: "0.1%",
        totalFee: "0.55",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bridge routes" });
    }
  });

  // Yield Farming Opportunities
  app.get("/api/yield/opportunities", async (req, res) => {
    try {
      const opportunities = [
        { id: "1", protocol: "Uniswap V3", pair: "ETH/USDC", apy: 24.5, tvl: "450000000", risk: "low", network: "eth" },
        { id: "2", protocol: "PancakeSwap", pair: "BNB/BUSD", apy: 18.2, tvl: "320000000", risk: "low", network: "bsc" },
        { id: "3", protocol: "QuickSwap", pair: "MATIC/USDC", apy: 32.8, tvl: "85000000", risk: "medium", network: "polygon" },
        { id: "4", protocol: "Aave", pair: "ETH Supply", apy: 4.2, tvl: "890000000", risk: "low", network: "eth" },
        { id: "5", protocol: "Compound", pair: "USDC Supply", apy: 3.8, tvl: "560000000", risk: "low", network: "eth" },
        { id: "6", protocol: "Curve", pair: "3Pool", apy: 8.5, tvl: "1200000000", risk: "low", network: "eth" },
      ];

      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch yield opportunities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDemoData(userId: string) {
  // Check if data already exists
  const existingPortfolios = await storage.getPortfolios(userId);
  if (existingPortfolios.length > 0) return;

  // Create demo portfolios
  await storage.createPortfolio({
    userId,
    networkId: "eth",
    tokenSymbol: "ETH",
    balance: "12.5",
    usdValue: "23456.78",
  });

  await storage.createPortfolio({
    userId,
    networkId: "bsc",
    tokenSymbol: "BNB",
    balance: "45.2",
    usdValue: "15234.56",
  });

  await storage.createPortfolio({
    userId,
    networkId: "polygon",
    tokenSymbol: "MATIC",
    balance: "1234.5",
    usdValue: "7032.11",
  });

  // Create demo trading signals
  await storage.createTradingSignal({
    symbol: "ETH/USDT",
    action: "BUY",
    confidence: "87.5",
    targetPrice: "2450.00",
    reasoning:
      "Strong bullish momentum with high volume. RSI indicating oversold conditions. Historical support at $2400 level.",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await storage.createTradingSignal({
    symbol: "BTC/USDT",
    action: "HOLD",
    confidence: "72.3",
    targetPrice: "42500.00",
    reasoning:
      "Consolidation phase detected. Wait for breakout above $43k resistance or entry below $41k support.",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await storage.createTradingSignal({
    symbol: "MATIC/USDT",
    action: "SELL",
    confidence: "65.8",
    targetPrice: "0.82",
    reasoning:
      "Overbought RSI with decreasing volume. Potential correction to $0.80 support level.",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Create demo staking positions
  await storage.createStakingPosition({
    userId,
    networkId: "eth",
    amount: "5.5",
    apy: "4.5",
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  });

  await storage.createStakingPosition({
    userId,
    networkId: "polygon",
    amount: "500",
    apy: "12.5",
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
  });

  // Update rewards for existing positions
  const positions = await storage.getStakingPositions(userId);
  for (const position of positions) {
    const daysStaked = Math.floor(
      (Date.now() - position.startDate!.getTime()) / (1000 * 60 * 60 * 24)
    );
    const rewards =
      (parseFloat(position.amount) *
        parseFloat(position.apy) *
        daysStaked) /
      365 /
      100;
    await storage.updateStakingPosition(position.id, {
      rewardsEarned: rewards.toFixed(4),
    });
  }

  // Create demo price data
  await storage.updatePriceData({
    symbol: "ETH",
    price: "2423.45",
    change24h: "3.2",
    volume24h: "15234567890",
    marketCap: "291234567890",
  });

  await storage.updatePriceData({
    symbol: "BTC",
    price: "42134.56",
    change24h: "-1.5",
    volume24h: "32456789012",
    marketCap: "823456789012",
  });

  await storage.updatePriceData({
    symbol: "MATIC",
    price: "0.85",
    change24h: "5.8",
    volume24h: "456789012",
    marketCap: "7890123456",
  });
}
