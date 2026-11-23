import ccxt, { Exchange, Order, Balance, Ticker } from "ccxt";
import { log } from "./index";

type ExchangeName = "coinbase" | "kraken" | "binance";

interface ExchangeCredentials {
  apiKey: string;
  secret: string;
  password?: string;
}

interface TradeResult {
  success: boolean;
  orderId?: string;
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  total: number;
  error?: string;
}

interface ExchangeBalance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

interface ExchangeTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

let exchange: Exchange | null = null;
let exchangeName: ExchangeName | null = null;
let isLiveMode = false;

export function isLiveTradingEnabled(): boolean {
  return isLiveMode && exchange !== null;
}

export function getExchangeName(): string | null {
  return exchangeName;
}

export async function initializeExchange(
  name: ExchangeName,
  credentials: ExchangeCredentials
): Promise<{ success: boolean; error?: string }> {
  try {
    log(`Initializing ${name} exchange connection...`, "exchange");

    const exchangeConfig: any = {
      apiKey: credentials.apiKey,
      secret: credentials.secret,
      sandbox: false,
      enableRateLimit: true,
    };

    if (credentials.password) {
      exchangeConfig.password = credentials.password;
    }

    switch (name) {
      case "coinbase":
        exchange = new ccxt.coinbase(exchangeConfig);
        break;
      case "kraken":
        exchange = new ccxt.kraken(exchangeConfig);
        break;
      case "binance":
        exchange = new ccxt.binance(exchangeConfig);
        break;
      default:
        return { success: false, error: `Unsupported exchange: ${name}` };
    }

    await exchange.loadMarkets();

    const balance = await exchange.fetchBalance();
    log(`${name} connection successful. Balance loaded.`, "exchange");

    exchangeName = name;
    isLiveMode = true;

    return { success: true };
  } catch (error: any) {
    log(`Exchange initialization failed: ${error.message}`, "exchange");
    exchange = null;
    exchangeName = null;
    isLiveMode = false;
    return {
      success: false,
      error: error.message || "Failed to connect to exchange",
    };
  }
}

export function disconnectExchange(): void {
  exchange = null;
  exchangeName = null;
  isLiveMode = false;
  log("Exchange disconnected", "exchange");
}

export async function getAccountBalances(): Promise<ExchangeBalance[]> {
  if (!exchange) {
    throw new Error("Exchange not initialized");
  }

  try {
    const balance = await exchange.fetchBalance();
    const balances: ExchangeBalance[] = [];
    const totalBalances = balance.total as unknown as Record<string, number>;
    const freeBalances = balance.free as unknown as Record<string, number>;
    const usedBalances = balance.used as unknown as Record<string, number>;

    for (const currency of Object.keys(totalBalances)) {
      const total = totalBalances[currency];
      if (total && total > 0) {
        balances.push({
          currency,
          free: freeBalances[currency] || 0,
          used: usedBalances[currency] || 0,
          total,
        });
      }
    }

    return balances;
  } catch (error: any) {
    log(`Failed to fetch balances: ${error.message}`, "exchange");
    throw error;
  }
}

export async function getLiveTicker(symbol: string): Promise<ExchangeTicker | null> {
  if (!exchange) {
    return null;
  }

  try {
    const formattedSymbol = formatSymbolForExchange(symbol);
    const ticker = await exchange.fetchTicker(formattedSymbol);

    return {
      symbol,
      price: ticker.last || ticker.close || 0,
      change24h: ticker.percentage || 0,
      high24h: ticker.high || 0,
      low24h: ticker.low || 0,
      volume24h: ticker.quoteVolume || ticker.baseVolume || 0,
    };
  } catch (error: any) {
    log(`Failed to fetch ticker for ${symbol}: ${error.message}`, "exchange");
    return null;
  }
}

export async function getLiveTickers(
  symbols: string[]
): Promise<Map<string, ExchangeTicker>> {
  const tickers = new Map<string, ExchangeTicker>();

  if (!exchange) {
    return tickers;
  }

  try {
    if (exchange.has["fetchTickers"]) {
      const formattedSymbols = symbols.map(formatSymbolForExchange);
      const allTickers = await exchange.fetchTickers(formattedSymbols);

      for (const symbol of symbols) {
        const formattedSymbol = formatSymbolForExchange(symbol);
        const ticker = allTickers[formattedSymbol];
        if (ticker) {
          tickers.set(symbol, {
            symbol,
            price: ticker.last || ticker.close || 0,
            change24h: ticker.percentage || 0,
            high24h: ticker.high || 0,
            low24h: ticker.low || 0,
            volume24h: ticker.quoteVolume || ticker.baseVolume || 0,
          });
        }
      }
    } else {
      for (const symbol of symbols) {
        const ticker = await getLiveTicker(symbol);
        if (ticker) {
          tickers.set(symbol, ticker);
        }
      }
    }
  } catch (error: any) {
    log(`Failed to fetch tickers: ${error.message}`, "exchange");
  }

  return tickers;
}

export async function executeLiveTrade(
  symbol: string,
  side: "buy" | "sell",
  amount: number,
  price?: number
): Promise<TradeResult> {
  if (!exchange) {
    return {
      success: false,
      symbol,
      side,
      amount,
      price: price || 0,
      total: 0,
      error: "Exchange not initialized",
    };
  }

  try {
    const formattedSymbol = formatSymbolForExchange(symbol);
    log(
      `Executing ${side} order: ${amount} ${formattedSymbol} at ${price ? `$${price}` : "market"}`,
      "exchange"
    );

    let order: Order;

    if (price) {
      order = await exchange.createLimitOrder(formattedSymbol, side, amount, price);
    } else {
      order = await exchange.createMarketOrder(formattedSymbol, side, amount);
    }

    const filledPrice = order.average || order.price || price || 0;
    const filledAmount = order.filled || amount;
    const total = filledPrice * filledAmount;

    log(
      `Order executed: ${order.id} - ${side} ${filledAmount} ${symbol} @ $${filledPrice}`,
      "exchange"
    );

    return {
      success: true,
      orderId: order.id,
      symbol,
      side,
      amount: filledAmount,
      price: filledPrice,
      total,
    };
  } catch (error: any) {
    log(`Trade execution failed: ${error.message}`, "exchange");
    return {
      success: false,
      symbol,
      side,
      amount,
      price: price || 0,
      total: 0,
      error: error.message,
    };
  }
}

export async function cancelOrder(orderId: string, symbol: string): Promise<boolean> {
  if (!exchange) {
    return false;
  }

  try {
    const formattedSymbol = formatSymbolForExchange(symbol);
    await exchange.cancelOrder(orderId, formattedSymbol);
    log(`Order ${orderId} cancelled`, "exchange");
    return true;
  } catch (error: any) {
    log(`Failed to cancel order ${orderId}: ${error.message}`, "exchange");
    return false;
  }
}

export async function getOpenOrders(symbol?: string): Promise<Order[]> {
  if (!exchange) {
    return [];
  }

  try {
    const formattedSymbol = symbol ? formatSymbolForExchange(symbol) : undefined;
    return await exchange.fetchOpenOrders(formattedSymbol);
  } catch (error: any) {
    log(`Failed to fetch open orders: ${error.message}`, "exchange");
    return [];
  }
}

export async function getMinimumOrderSize(symbol: string): Promise<number> {
  if (!exchange) {
    return 0.001;
  }

  try {
    const formattedSymbol = formatSymbolForExchange(symbol);
    const market = exchange.markets[formattedSymbol];
    if (market && market.limits && market.limits.amount) {
      return market.limits.amount.min || 0.001;
    }
    return 0.001;
  } catch (error) {
    return 0.001;
  }
}

export async function validateTradeAmount(
  symbol: string,
  amount: number,
  side: "buy" | "sell"
): Promise<{ valid: boolean; error?: string }> {
  if (!exchange) {
    return { valid: false, error: "Exchange not initialized" };
  }

  try {
    const minSize = await getMinimumOrderSize(symbol);
    if (amount < minSize) {
      return {
        valid: false,
        error: `Minimum order size is ${minSize}`,
      };
    }

    if (side === "buy") {
      const balances = await getAccountBalances();
      const usdBalance = balances.find(
        (b) => b.currency === "USD" || b.currency === "USDT"
      );
      const ticker = await getLiveTicker(symbol);
      const requiredFunds = (ticker?.price || 0) * amount;

      if (!usdBalance || usdBalance.free < requiredFunds) {
        return {
          valid: false,
          error: `Insufficient funds. Required: $${requiredFunds.toFixed(2)}`,
        };
      }
    } else {
      const assetSymbol = symbol.split("/")[0];
      const balances = await getAccountBalances();
      const assetBalance = balances.find((b) => b.currency === assetSymbol);

      if (!assetBalance || assetBalance.free < amount) {
        return {
          valid: false,
          error: `Insufficient ${assetSymbol}. Available: ${assetBalance?.free || 0}`,
        };
      }
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

function formatSymbolForExchange(symbol: string): string {
  if (symbol.includes("/")) {
    return symbol;
  }
  if (symbol.endsWith("USDT") || symbol.endsWith("USD")) {
    const base = symbol.replace(/USDT?$/, "");
    const quote = symbol.endsWith("USDT") ? "USDT" : "USD";
    return `${base}/${quote}`;
  }
  return `${symbol}/USDT`;
}

export function getSupportedExchanges(): { id: ExchangeName; name: string }[] {
  return [
    { id: "coinbase", name: "Coinbase" },
    { id: "kraken", name: "Kraken" },
    { id: "binance", name: "Binance" },
  ];
}
