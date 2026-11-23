import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMarketPrices, getChartData, getCurrentPrice } from "./market-data";
import { generateMarketInsights } from "./ai-service";
import { setupWebSocket } from "./websocket";
import { startBot, stopBot, isBotRunning, getAvailableFunds, adjustFunds, setAvailableFunds, activateKillSwitch, deactivateKillSwitch, isKillSwitchActive, getDailyLoss, checkPositionSizeLimit, recordLossForManualClose, MAX_DAILY_LOSS_PERCENT, MAX_POSITION_PERCENT } from "./trading-bot";
import { insertTradeSchema, insertPositionSchema } from "@shared/schema";
import { z } from "zod";
import {
  initializeExchange,
  disconnectExchange,
  getAccountBalances,
  isLiveTradingEnabled,
  getExchangeName,
  getSupportedExchanges,
  executeLiveTrade,
  getLiveTickers,
  validateTradeAmount,
} from "./exchange-service";

// Default user ID for MVP (single user mode)
let DEFAULT_USER_ID = "";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Ensure default user exists
  async function ensureDefaultUser() {
    if (DEFAULT_USER_ID) return DEFAULT_USER_ID;
    
    let user = await storage.getUserByUsername("demo-trader");
    if (!user) {
      user = await storage.createUser({
        username: "demo-trader",
        password: "demo-password-hash",
      });
    }
    DEFAULT_USER_ID = user.id;
    return DEFAULT_USER_ID;
  }
  
  // Initialize bot settings if not exists
  async function ensureBotSettings() {
    const userId = await ensureDefaultUser();
    let settings = await storage.getBotSettings(userId);
    if (!settings) {
      settings = await storage.createBotSettings({
        userId,
        isActive: false,
        tradingPairs: ["BTC/USDT", "ETH/USDT"],
        profitTarget: "10.00",
        stopLoss: "15.00",
        maxTradeAmount: "1000.00",
        strategy: "aggressive",
      });
    }
    return settings;
  }

  // Market Data Routes
  app.get("/api/market/prices", (_, res) => {
    const prices = getMarketPrices();
    res.json(prices);
  });

  app.get("/api/market/chart/:symbol", (req, res) => {
    const symbol = decodeURIComponent(req.params.symbol);
    const timeframe = req.query.timeframe as string || "1D";
    const chartData = getChartData(symbol, timeframe);
    res.json(chartData);
  });

  // Portfolio Routes
  app.get("/api/portfolio/summary", async (_, res) => {
    try {
      const userId = await ensureDefaultUser();
      const holdings = await storage.getHoldings(userId);
      const positions = await storage.getPositions(userId);
      const trades = await storage.getTrades(userId);
      const prices = getMarketPrices();
      
      const priceMap = new Map(prices.map(p => [p.symbol.split("/")[0], p.price]));
      
      // Calculate total holdings value
      let holdingsValue = 0;
      holdings.forEach(h => {
        const price = priceMap.get(h.symbol) || 0;
        holdingsValue += parseFloat(h.quantity) * price;
      });
      
      const totalBalance = getAvailableFunds() + holdingsValue;
      
      // Calculate P&L from completed trades today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTrades = trades.filter(t => {
        if (!t.executedAt) return false;
        const tradeDate = new Date(t.executedAt);
        return tradeDate >= today;
      });
      
      let totalPnL = 0;
      todayTrades.forEach(t => {
        if (t.type === "sell") {
          totalPnL += parseFloat(t.total);
        } else {
          totalPnL -= parseFloat(t.total);
        }
      });
      
      // Calculate win rate
      const closedPositions = positions.filter(p => p.status === "closed");
      const wins = closedPositions.filter(p => {
        const entryPrice = parseFloat(p.entryPrice);
        const targetPrice = parseFloat(p.targetPrice);
        return targetPrice > entryPrice; // Simplified win detection
      });
      const winRate = closedPositions.length > 0 
        ? (wins.length / closedPositions.length) * 100 
        : 0;
      
      const activePositions = positions.filter(p => p.status === "open").length;
      
      res.json({
        totalBalance,
        totalPnL,
        pnlPercentage: totalBalance > 0 ? (totalPnL / totalBalance) * 100 : 0,
        availableFunds: getAvailableFunds(),
        activePositions,
        winRate,
      });
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      res.status(500).json({ error: "Failed to fetch portfolio summary" });
    }
  });

  app.get("/api/portfolio/holdings", async (_, res) => {
    try {
      const userId = await ensureDefaultUser();
      const holdings = await storage.getHoldings(userId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  });

  // Trades Routes
  app.get("/api/trades", async (_, res) => {
    try {
      const userId = await ensureDefaultUser();
      const trades = await storage.getTrades(userId);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  const tradeRequestSchema = z.object({
    type: z.enum(["buy", "sell"]),
    amount: z.number().positive(),
    price: z.number().positive(),
    symbol: z.string(),
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const userId = await ensureDefaultUser();
      const { type, amount, price, symbol } = tradeRequestSchema.parse(req.body);
      const total = amount * price;
      const assetSymbol = symbol.split("/")[0];
      
      if (type === "buy") {
        if (total > getAvailableFunds()) {
          return res.status(400).json({ error: "Insufficient funds" });
        }
        
        // Enforce position size limit for buy orders
        const holdings = await storage.getHoldings(userId);
        const prices = getMarketPrices();
        const priceMap = new Map(prices.map(p => [p.symbol.split("/")[0], p.price]));
        let holdingsValue = 0;
        holdings.forEach(h => {
          const hPrice = priceMap.get(h.symbol) || 0;
          holdingsValue += parseFloat(h.quantity) * hPrice;
        });
        const totalPortfolioValue = getAvailableFunds() + holdingsValue;
        
        const positionCheck = checkPositionSizeLimit(total, totalPortfolioValue);
        if (!positionCheck.allowed) {
          return res.status(400).json({ error: positionCheck.reason });
        }
        
        adjustFunds(-total);
        
        // Update or create holding
        const existingHolding = await storage.getHolding(userId, assetSymbol);
        if (existingHolding) {
          const newQuantity = parseFloat(existingHolding.quantity) + amount;
          const totalCost = parseFloat(existingHolding.quantity) * parseFloat(existingHolding.averageBuyPrice) + total;
          const newAvgPrice = totalCost / newQuantity;
          await storage.updateHolding(existingHolding.id, {
            quantity: newQuantity.toString(),
            averageBuyPrice: newAvgPrice.toString(),
          });
        } else {
          await storage.createHolding({
            userId,
            symbol: assetSymbol,
            name: symbol,
            quantity: amount.toString(),
            averageBuyPrice: price.toString(),
          });
        }
        
        // Create position for tracking
        const targetPrice = price * 1.10; // 10% profit target
        const stopLossPrice = price * 0.85; // 15% stop loss
        await storage.createPosition({
          userId,
          symbol,
          entryPrice: price.toString(),
          quantity: amount.toString(),
          targetPrice: targetPrice.toString(),
          stopLossPrice: stopLossPrice.toString(),
          status: "open",
        });
      } else {
        // Selling
        const existingHolding = await storage.getHolding(userId, assetSymbol);
        if (!existingHolding || parseFloat(existingHolding.quantity) < amount) {
          return res.status(400).json({ error: "Insufficient holdings" });
        }
        
        const newQuantity = parseFloat(existingHolding.quantity) - amount;
        if (newQuantity <= 0) {
          // Remove holding if quantity is 0
          await storage.updateHolding(existingHolding.id, { quantity: "0" });
        } else {
          await storage.updateHolding(existingHolding.id, {
            quantity: newQuantity.toString(),
          });
        }
        
        adjustFunds(total);
      }
      
      // Record trade
      const trade = await storage.createTrade({
        userId,
        symbol,
        type,
        quantity: amount.toString(),
        price: price.toString(),
        total: total.toString(),
        status: "completed",
        isBot: false,
      });
      
      res.json(trade);
    } catch (error) {
      console.error("Error executing trade:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trade parameters" });
      }
      res.status(500).json({ error: "Failed to execute trade" });
    }
  });

  // Positions Routes
  app.get("/api/positions", async (_, res) => {
    try {
      const userId = await ensureDefaultUser();
      const positions = await storage.getPositions(userId);
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.post("/api/positions/:id/close", async (req, res) => {
    try {
      const { id } = req.params;
      const position = await storage.getPosition(id);
      
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }
      
      if (position.status !== "open") {
        return res.status(400).json({ error: "Position already closed" });
      }
      
      // Get current price and execute sell
      const currentPrice = getCurrentPrice(position.symbol);
      const quantity = parseFloat(position.quantity);
      const total = quantity * currentPrice;
      
      // Update holdings
      const userId = await ensureDefaultUser();
      const assetSymbol = position.symbol.split("/")[0];
      const existingHolding = await storage.getHolding(userId, assetSymbol);
      if (existingHolding) {
        const newQuantity = parseFloat(existingHolding.quantity) - quantity;
        await storage.updateHolding(existingHolding.id, {
          quantity: Math.max(0, newQuantity).toString(),
        });
      }
      
      adjustFunds(total);
      
      // Record the sell trade
      await storage.createTrade({
        userId,
        symbol: position.symbol,
        type: "sell",
        quantity: quantity.toString(),
        price: currentPrice.toString(),
        total: total.toString(),
        status: "completed",
        isBot: false,
      });
      
      // Record loss for safety tracking if this was a losing trade
      const entryPrice = parseFloat(position.entryPrice);
      await recordLossForManualClose(entryPrice, currentPrice, quantity);
      
      // Close the position
      const closedPosition = await storage.closePosition(id);
      res.json(closedPosition);
    } catch (error) {
      console.error("Error closing position:", error);
      res.status(500).json({ error: "Failed to close position" });
    }
  });

  // Bot Settings Routes
  app.get("/api/bot/settings", async (_, res) => {
    try {
      const settings = await ensureBotSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching bot settings:", error);
      res.status(500).json({ error: "Failed to fetch bot settings" });
    }
  });

  app.put("/api/bot/settings", async (req, res) => {
    try {
      const settings = await ensureBotSettings();
      const updates = req.body;
      const updated = await storage.updateBotSettings(settings.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating bot settings:", error);
      res.status(500).json({ error: "Failed to update bot settings" });
    }
  });

  app.post("/api/bot/toggle", async (req, res) => {
    try {
      const { active } = req.body;
      const userId = await ensureDefaultUser();
      const settings = await ensureBotSettings();
      
      if (active && isKillSwitchActive()) {
        return res.status(400).json({ error: "Cannot start bot - kill switch is active" });
      }
      
      const updated = await storage.updateBotSettings(settings.id, { isActive: active });
      
      if (active && !isBotRunning()) {
        startBot(updated!, userId);
      } else if (!active && isBotRunning()) {
        stopBot();
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error toggling bot:", error);
      res.status(500).json({ error: "Failed to toggle bot" });
    }
  });

  app.get("/api/bot/safety", async (_, res) => {
    const dailyLoss = await getDailyLoss();
    res.json({
      killSwitchActive: isKillSwitchActive(),
      dailyLoss: dailyLoss.amount,
      dailyLossPercent: dailyLoss.percentage,
      maxDailyLossPercent: MAX_DAILY_LOSS_PERCENT,
      maxPositionPercent: MAX_POSITION_PERCENT,
    });
  });

  app.post("/api/bot/kill-switch", async (req, res) => {
    try {
      const { activate, reason } = req.body;
      
      if (activate) {
        const result = await activateKillSwitch(reason || "manual");
        
        const settings = await ensureBotSettings();
        await storage.updateBotSettings(settings.id, { isActive: false });
        
        res.json(result);
      } else {
        const success = deactivateKillSwitch();
        res.json({ success, message: success ? "Kill switch deactivated" : "Kill switch was not active" });
      }
    } catch (error) {
      console.error("Error toggling kill switch:", error);
      res.status(500).json({ error: "Failed to toggle kill switch" });
    }
  });

  // AI Insights Routes
  app.get("/api/ai/insights", async (_, res) => {
    try {
      const prices = getMarketPrices();
      const insights = await generateMarketInsights(prices.slice(0, 5));
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ error: "Failed to fetch AI insights" });
    }
  });

  app.post("/api/ai/insights/refresh", async (_, res) => {
    try {
      const prices = getMarketPrices();
      const insights = await generateMarketInsights(prices);
      res.json(insights);
    } catch (error) {
      console.error("Error refreshing AI insights:", error);
      res.status(500).json({ error: "Failed to refresh AI insights" });
    }
  });

  // Exchange Connection Routes
  app.get("/api/exchange/supported", (_, res) => {
    res.json(getSupportedExchanges());
  });

  app.get("/api/exchange/status", (_, res) => {
    res.json({
      connected: isLiveTradingEnabled(),
      exchange: getExchangeName(),
    });
  });

  const connectExchangeSchema = z.object({
    exchange: z.enum(["coinbase", "kraken", "binance"]),
    apiKey: z.string().min(1),
    secret: z.string().min(1),
    password: z.string().optional(),
  });

  app.post("/api/exchange/connect", async (req, res) => {
    try {
      const { exchange, apiKey, secret, password } = connectExchangeSchema.parse(req.body);
      
      const result = await initializeExchange(exchange, {
        apiKey,
        secret,
        password,
      });

      if (result.success) {
        const balances = await getAccountBalances();
        res.json({ 
          success: true, 
          exchange, 
          balances,
          message: `Successfully connected to ${exchange}` 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error: any) {
      console.error("Error connecting to exchange:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid credentials format" 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to connect to exchange" 
      });
    }
  });

  app.post("/api/exchange/disconnect", (_, res) => {
    disconnectExchange();
    res.json({ success: true, message: "Disconnected from exchange" });
  });

  app.get("/api/exchange/balances", async (_, res) => {
    try {
      if (!isLiveTradingEnabled()) {
        return res.status(400).json({ error: "No exchange connected" });
      }
      const balances = await getAccountBalances();
      res.json(balances);
    } catch (error: any) {
      console.error("Error fetching exchange balances:", error);
      res.status(500).json({ error: error.message || "Failed to fetch balances" });
    }
  });

  app.get("/api/exchange/tickers", async (req, res) => {
    try {
      if (!isLiveTradingEnabled()) {
        return res.status(400).json({ error: "No exchange connected" });
      }
      const symbols = (req.query.symbols as string)?.split(",") || ["BTC/USDT", "ETH/USDT"];
      const tickers = await getLiveTickers(symbols);
      res.json(Object.fromEntries(tickers));
    } catch (error: any) {
      console.error("Error fetching exchange tickers:", error);
      res.status(500).json({ error: error.message || "Failed to fetch tickers" });
    }
  });

  const liveTradeSchema = z.object({
    symbol: z.string(),
    side: z.enum(["buy", "sell"]),
    amount: z.number().positive(),
    price: z.number().positive().optional(),
  });

  app.post("/api/exchange/trade", async (req, res) => {
    try {
      if (!isLiveTradingEnabled()) {
        return res.status(400).json({ error: "No exchange connected" });
      }

      const userId = await ensureDefaultUser();
      const { symbol, side, amount, price } = liveTradeSchema.parse(req.body);

      const validation = await validateTradeAmount(symbol, amount, side);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const result = await executeLiveTrade(symbol, side, amount, price);
      
      if (result.success) {
        await storage.createTrade({
          userId,
          symbol,
          type: side,
          quantity: result.amount.toString(),
          price: result.price.toString(),
          total: result.total.toString(),
          status: "completed",
          isBot: false,
        });
        
        res.json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error: any) {
      console.error("Error executing live trade:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trade parameters" });
      }
      res.status(500).json({ error: error.message || "Failed to execute trade" });
    }
  });

  // Setup WebSocket for real-time price updates
  setupWebSocket(httpServer);

  return httpServer;
}
