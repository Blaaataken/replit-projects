import { storage } from "./storage";
import { getMarketPrices, getCurrentPrice } from "./market-data";
import { broadcastTradeExecuted, broadcastPositionClosed, broadcastKillSwitch, broadcastSafetyUpdate } from "./websocket";
import { log } from "./index";
import {
  isLiveTradingEnabled,
  getLiveTicker,
  executeLiveTrade,
  getAccountBalances,
  getExchangeName,
  disconnectExchange,
} from "./exchange-service";
import type { BotSettings, Position } from "@shared/schema";

let currentUserId: string | null = null;

let botInterval: NodeJS.Timeout | null = null;
let isRunning = false;
let availableFunds = 10000;
let killSwitchActive = false;
let dailyLossAmount = 0;
let dailyLossDate = new Date().toDateString();
let dailyStartingEquity = 10000;
export const MAX_DAILY_LOSS_PERCENT = 10;
export const MAX_POSITION_PERCENT = 25;

export function getAvailableFunds() {
  return availableFunds;
}

export function setAvailableFunds(funds: number) {
  availableFunds = funds;
}

export function adjustFunds(amount: number) {
  availableFunds += amount;
}

export function isKillSwitchActive(): boolean {
  return killSwitchActive;
}

export async function getDailyLoss(): Promise<{ amount: number; percentage: number }> {
  await resetDailyLossIfNewDay();
  const percentage = dailyStartingEquity > 0 ? (dailyLossAmount / dailyStartingEquity) * 100 : 0;
  return { amount: dailyLossAmount, percentage };
}

export function setDailyStartingEquity(equity: number) {
  dailyStartingEquity = equity;
}

export function setCurrentUserId(userId: string) {
  currentUserId = userId;
}

async function calculateTotalEquity(): Promise<number> {
  let totalEquity = availableFunds;
  
  if (currentUserId) {
    try {
      const holdings = await storage.getHoldings(currentUserId);
      const prices = getMarketPrices();
      const priceMap = new Map(prices.map(p => [p.symbol.split("/")[0], p.price]));
      
      for (const holding of holdings) {
        const price = priceMap.get(holding.symbol) || 0;
        const holdingValue = parseFloat(holding.quantity) * price;
        totalEquity += holdingValue;
      }
    } catch (error) {
      log(`Failed to calculate holdings value: ${error}`, "bot");
    }
  }
  
  return totalEquity;
}

async function resetDailyLossIfNewDay() {
  const today = new Date().toDateString();
  if (dailyLossDate !== today) {
    dailyLossAmount = 0;
    dailyLossDate = today;
    dailyStartingEquity = await calculateTotalEquity();
    log(`Daily loss counter reset for new day. Starting equity: $${dailyStartingEquity.toFixed(2)}`, "bot");
  }
}

async function recordLoss(amount: number) {
  await resetDailyLossIfNewDay();
  if (amount > 0) {
    dailyLossAmount += amount;
    const lossPercent = dailyStartingEquity > 0 ? (dailyLossAmount / dailyStartingEquity) * 100 : 0;
    log(`Daily loss recorded: $${amount.toFixed(2)} (Total today: $${dailyLossAmount.toFixed(2)}, ${lossPercent.toFixed(1)}%)`, "bot");
    
    broadcastSafetyUpdate({
      dailyLoss: dailyLossAmount,
      dailyLossPercent: lossPercent,
      killSwitchActive: killSwitchActive,
    });
    
    if (lossPercent >= MAX_DAILY_LOSS_PERCENT) {
      log(`SAFETY: Daily loss limit of ${MAX_DAILY_LOSS_PERCENT}% reached! Activating kill switch.`, "bot");
      await activateKillSwitch("daily_loss_limit");
    }
  }
}

export async function recordLossForManualClose(entryPrice: number, exitPrice: number, quantity: number) {
  const entryValue = entryPrice * quantity;
  const exitValue = exitPrice * quantity;
  const loss = entryValue - exitValue;
  if (loss > 0) {
    await recordLoss(loss);
  }
}

export async function activateKillSwitch(reason: string = "manual"): Promise<{
  success: boolean;
  positionsClosed: number;
  message: string;
}> {
  log(`KILL SWITCH ACTIVATED - Reason: ${reason}`, "bot");
  killSwitchActive = true;
  
  stopBot();
  
  disconnectExchange();
  
  if (currentUserId) {
    try {
      const settings = await storage.getBotSettings(currentUserId);
      if (settings) {
        await storage.updateBotSettings(settings.id, { isActive: false });
        log("Bot settings persisted with isActive=false", "bot");
      }
    } catch (error) {
      log(`Failed to persist bot settings: ${error}`, "bot");
    }
  }
  
  broadcastKillSwitch({ active: true, reason });
  
  return {
    success: true,
    positionsClosed: 0,
    message: `Kill switch activated. Trading halted. Reason: ${reason}`,
  };
}

export function deactivateKillSwitch(): boolean {
  if (!killSwitchActive) {
    return false;
  }
  
  stopBot();
  
  killSwitchActive = false;
  log(`Kill switch deactivated. Daily loss retained at $${dailyLossAmount.toFixed(2)} until day rollover. Bot stopped - requires manual restart to resume trading.`, "bot");
  broadcastKillSwitch({ active: false, reason: "manual_reset" });
  return true;
}

export function checkPositionSizeLimit(
  tradeAmount: number,
  totalPortfolioValue: number
): { allowed: boolean; reason?: string } {
  const positionPercent = (tradeAmount / totalPortfolioValue) * 100;
  
  if (positionPercent > MAX_POSITION_PERCENT) {
    return {
      allowed: false,
      reason: `Trade would be ${positionPercent.toFixed(1)}% of portfolio. Maximum allowed is ${MAX_POSITION_PERCENT}%.`,
    };
  }
  
  return { allowed: true };
}

export async function startBot(settings: BotSettings, userId: string) {
  if (killSwitchActive) {
    log("Cannot start bot - kill switch is active", "bot");
    return;
  }
  
  if (isRunning) {
    log("Bot is already running", "bot");
    return;
  }

  setCurrentUserId(userId);
  
  // Initialize daily starting equity with actual portfolio value on startup
  dailyStartingEquity = await calculateTotalEquity();
  log(`Bot startup: Daily starting equity initialized to $${dailyStartingEquity.toFixed(2)}`, "bot");
  
  await resetDailyLossIfNewDay();
  
  isRunning = true;
  const isLive = isLiveTradingEnabled();
  const exchangeInfo = getExchangeName();

  if (isLive) {
    log(`Starting trading bot in LIVE mode on ${exchangeInfo} with aggressive strategy`, "bot");
  } else {
    log("Starting trading bot in SIMULATION mode with aggressive strategy", "bot");
  }

  botInterval = setInterval(async () => {
    try {
      await executeBotCycle(settings, userId);
    } catch (error) {
      log(`Bot cycle error: ${error}`, "bot");
    }
  }, 5000);
}

export function isLiveMode(): boolean {
  return isLiveTradingEnabled();
}

export function stopBot() {
  if (botInterval) {
    clearInterval(botInterval);
    botInterval = null;
  }
  isRunning = false;
  log("Trading bot stopped", "bot");
}

export function isBotRunning() {
  return isRunning;
}

async function executeBotCycle(settings: BotSettings, userId: string) {
  if (killSwitchActive) {
    log("Bot cycle skipped - kill switch active", "bot");
    stopBot();
    return;
  }
  
  const freshSettings = await storage.getBotSettings(userId);
  if (!freshSettings || !freshSettings.isActive) {
    log("Bot cycle skipped - bot disabled in settings", "bot");
    stopBot();
    return;
  }
  
  const isLive = isLiveTradingEnabled();
  const positions = await storage.getPositions(userId);
  const openPositions = positions.filter((p) => p.status === "open");

  for (const position of openPositions) {
    if (killSwitchActive) {
      log("Exiting position loop - kill switch activated", "bot");
      return;
    }
    await checkPositionForExit(position, freshSettings, userId, isLive);
  }

  if (killSwitchActive) {
    return;
  }
  
  if (freshSettings.isActive && freshSettings.strategy === "aggressive") {
    await lookForEntryOpportunities(freshSettings, userId, openPositions.length, isLive);
  }
}

async function checkPositionForExit(
  position: Position,
  settings: BotSettings,
  userId: string,
  isLive: boolean
) {
  let currentPrice: number;

  if (isLive) {
    const liveTicker = await getLiveTicker(position.symbol);
    if (!liveTicker) {
      log(`Failed to get live price for ${position.symbol}, skipping exit check`, "bot");
      return;
    }
    currentPrice = liveTicker.price;
  } else {
    currentPrice = getCurrentPrice(position.symbol);
  }

  const entryPrice = parseFloat(position.entryPrice);
  const targetPrice = parseFloat(position.targetPrice);
  const stopLossPrice = parseFloat(position.stopLossPrice);
  const quantity = parseFloat(position.quantity);

  const profitPct = ((currentPrice - entryPrice) / entryPrice) * 100;

  if (currentPrice >= targetPrice) {
    log(
      `Target hit for ${position.symbol}: +${profitPct.toFixed(2)}%${isLive ? " [LIVE]" : ""}`,
      "bot"
    );
    await executeExit(position, currentPrice, userId, "target", isLive);
  } else if (currentPrice <= stopLossPrice) {
    log(
      `Stop-loss triggered for ${position.symbol}: ${profitPct.toFixed(2)}%${isLive ? " [LIVE]" : ""}`,
      "bot"
    );
    await executeExit(position, currentPrice, userId, "stop_loss", isLive);
  }
}

async function executeExit(
  position: Position,
  currentPrice: number,
  userId: string,
  reason: "target" | "stop_loss",
  isLive: boolean
) {
  const quantity = parseFloat(position.quantity);

  if (isLive) {
    log(`Executing LIVE sell order for ${position.symbol}...`, "bot");
    const tradeResult = await executeLiveTrade(position.symbol, "sell", quantity);

    if (!tradeResult.success) {
      log(`LIVE trade failed: ${tradeResult.error}`, "bot");
      return;
    }

    const actualPrice = tradeResult.price;
    const actualTotal = tradeResult.total;

    const assetSymbol = position.symbol.split("/")[0];
    const existingHolding = await storage.getHolding(userId, assetSymbol);
    if (existingHolding) {
      const newQuantity = parseFloat(existingHolding.quantity) - tradeResult.amount;
      if (newQuantity <= 0) {
        await storage.updateHolding(existingHolding.id, { quantity: "0" });
      } else {
        await storage.updateHolding(existingHolding.id, {
          quantity: newQuantity.toString(),
        });
      }
    }

    const trade = await storage.createTrade({
      userId,
      symbol: position.symbol,
      type: "sell",
      quantity: tradeResult.amount.toString(),
      price: actualPrice.toString(),
      total: actualTotal.toString(),
      status: "completed",
      isBot: true,
    });

    await storage.closePosition(position.id);

    broadcastTradeExecuted(trade);
    broadcastPositionClosed({ ...position, status: "closed", reason });

    if (reason === "stop_loss") {
      const entryPrice = parseFloat(position.entryPrice);
      const entryValue = entryPrice * tradeResult.amount;
      const exitValue = actualTotal;
      const loss = entryValue - exitValue;
      if (loss > 0) {
        await recordLoss(loss);
      }
    }

    log(
      `[LIVE] Bot closed position: ${position.symbol} at $${actualPrice.toFixed(2)} (${reason})`,
      "bot"
    );
  } else {
    const total = quantity * currentPrice;

    const assetSymbol = position.symbol.split("/")[0];
    const existingHolding = await storage.getHolding(userId, assetSymbol);
    if (existingHolding) {
      const newQuantity = parseFloat(existingHolding.quantity) - quantity;
      await storage.updateHolding(existingHolding.id, {
        quantity: Math.max(0, newQuantity).toString(),
      });
    }

    adjustFunds(total);

    const trade = await storage.createTrade({
      userId,
      symbol: position.symbol,
      type: "sell",
      quantity: quantity.toString(),
      price: currentPrice.toString(),
      total: total.toString(),
      status: "completed",
      isBot: true,
    });

    await storage.closePosition(position.id);

    broadcastTradeExecuted(trade);
    broadcastPositionClosed({ ...position, status: "closed", reason });

    if (reason === "stop_loss") {
      const entryPrice = parseFloat(position.entryPrice);
      const entryValue = entryPrice * quantity;
      const exitValue = total;
      const loss = entryValue - exitValue;
      if (loss > 0) {
        await recordLoss(loss);
      }
    }

    log(
      `Bot closed position: ${position.symbol} at $${currentPrice.toFixed(2)} (${reason})`,
      "bot"
    );
  }
}

async function lookForEntryOpportunities(
  settings: BotSettings,
  userId: string,
  openPositionCount: number,
  isLive: boolean
) {
  if (openPositionCount >= 5) {
    return;
  }

  const maxTradeAmount = parseFloat(settings.maxTradeAmount);
  const tradingPairs = settings.tradingPairs || ["BTC/USDT", "ETH/USDT"];

  if (isLive) {
    let availableUSD = 0;
    try {
      const balances = await getAccountBalances();
      const usdBalance = balances.find((b) => b.currency === "USD" || b.currency === "USDT");
      availableUSD = usdBalance?.free || 0;
    } catch (error) {
      log(`Failed to get account balances: ${error}`, "bot");
      return;
    }

    if (availableUSD < maxTradeAmount * 0.1) {
      return;
    }

    for (const pair of tradingPairs) {
      const existingPositions = await storage.getPositions(userId);
      const hasPosition = existingPositions.some(
        (p) => p.symbol === pair && p.status === "open"
      );
      if (hasPosition) continue;

      const liveTicker = await getLiveTicker(pair);
      if (!liveTicker) continue;

      if (liveTicker.change24h < -2 && Math.random() > 0.7) {
        const profitTarget = parseFloat(settings.profitTarget) / 100;
        const stopLoss = parseFloat(settings.stopLoss) / 100;

        const tradeAmount = Math.min(maxTradeAmount, availableUSD * 0.2);
        
        // Enforce position size limit
        const totalEquity = await calculateTotalEquity();
        const positionCheck = checkPositionSizeLimit(tradeAmount, totalEquity);
        if (!positionCheck.allowed) {
          log(`SAFETY: Trade rejected - ${positionCheck.reason}`, "bot");
          continue;
        }
        
        const quantity = tradeAmount / liveTicker.price;
        const targetPrice = liveTicker.price * (1 + profitTarget);
        const stopLossPrice = liveTicker.price * (1 - stopLoss);

        log(`Executing LIVE buy order for ${pair}...`, "bot");
        const tradeResult = await executeLiveTrade(pair, "buy", quantity);

        if (!tradeResult.success) {
          log(`LIVE trade failed: ${tradeResult.error}`, "bot");
          continue;
        }

        const assetSymbol = pair.split("/")[0];
        const existingHolding = await storage.getHolding(userId, assetSymbol);
        if (existingHolding) {
          const newQuantity = parseFloat(existingHolding.quantity) + tradeResult.amount;
          const totalCost =
            parseFloat(existingHolding.quantity) *
              parseFloat(existingHolding.averageBuyPrice) +
            tradeResult.total;
          const newAvgPrice = totalCost / newQuantity;
          await storage.updateHolding(existingHolding.id, {
            quantity: newQuantity.toString(),
            averageBuyPrice: newAvgPrice.toString(),
          });
        } else {
          await storage.createHolding({
            userId,
            symbol: assetSymbol,
            name: pair,
            quantity: tradeResult.amount.toString(),
            averageBuyPrice: tradeResult.price.toString(),
          });
        }

        await storage.createPosition({
          userId,
          symbol: pair,
          entryPrice: tradeResult.price.toString(),
          quantity: tradeResult.amount.toString(),
          targetPrice: targetPrice.toString(),
          stopLossPrice: stopLossPrice.toString(),
          status: "open",
        });

        const trade = await storage.createTrade({
          userId,
          symbol: pair,
          type: "buy",
          quantity: tradeResult.amount.toString(),
          price: tradeResult.price.toString(),
          total: tradeResult.total.toString(),
          status: "completed",
          isBot: true,
        });

        broadcastTradeExecuted(trade);

        log(
          `[LIVE] Bot opened position: ${pair} at $${tradeResult.price.toFixed(2)} (dip buy)`,
          "bot"
        );
        break;
      }
    }
  } else {
    if (availableFunds < maxTradeAmount * 0.1) {
      return;
    }

    const prices = getMarketPrices();

    for (const pair of tradingPairs) {
      const priceData = prices.find((p) => p.symbol === pair);
      if (!priceData) continue;

      const existingPositions = await storage.getPositions(userId);
      const hasPosition = existingPositions.some(
        (p) => p.symbol === pair && p.status === "open"
      );
      if (hasPosition) continue;

      if (priceData.change24h < -2 && Math.random() > 0.7) {
        const profitTarget = parseFloat(settings.profitTarget) / 100;
        const stopLoss = parseFloat(settings.stopLoss) / 100;

        const tradeAmount = Math.min(maxTradeAmount, availableFunds * 0.2);
        
        // Enforce position size limit
        const totalEquity = await calculateTotalEquity();
        const positionCheck = checkPositionSizeLimit(tradeAmount, totalEquity);
        if (!positionCheck.allowed) {
          log(`SAFETY: Trade rejected - ${positionCheck.reason}`, "bot");
          continue;
        }
        
        const quantity = tradeAmount / priceData.price;
        const targetPrice = priceData.price * (1 + profitTarget);
        const stopLossPrice = priceData.price * (1 - stopLoss);

        adjustFunds(-tradeAmount);

        const assetSymbol = pair.split("/")[0];
        const existingHolding = await storage.getHolding(userId, assetSymbol);
        if (existingHolding) {
          const newQuantity = parseFloat(existingHolding.quantity) + quantity;
          const totalCost =
            parseFloat(existingHolding.quantity) *
              parseFloat(existingHolding.averageBuyPrice) +
            tradeAmount;
          const newAvgPrice = totalCost / newQuantity;
          await storage.updateHolding(existingHolding.id, {
            quantity: newQuantity.toString(),
            averageBuyPrice: newAvgPrice.toString(),
          });
        } else {
          await storage.createHolding({
            userId,
            symbol: assetSymbol,
            name: pair,
            quantity: quantity.toString(),
            averageBuyPrice: priceData.price.toString(),
          });
        }

        await storage.createPosition({
          userId,
          symbol: pair,
          entryPrice: priceData.price.toString(),
          quantity: quantity.toString(),
          targetPrice: targetPrice.toString(),
          stopLossPrice: stopLossPrice.toString(),
          status: "open",
        });

        const trade = await storage.createTrade({
          userId,
          symbol: pair,
          type: "buy",
          quantity: quantity.toString(),
          price: priceData.price.toString(),
          total: tradeAmount.toString(),
          status: "completed",
          isBot: true,
        });

        broadcastTradeExecuted(trade);

        log(
          `Bot opened position: ${pair} at $${priceData.price.toFixed(2)} (dip buy)`,
          "bot"
        );
        break;
      }
    }
  }
}
