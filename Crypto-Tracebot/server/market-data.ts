import type { CryptoPrice, ChartDataPoint } from "@shared/schema";

// Simulated market data for MVP (will be replaced with real exchange APIs)
const basePrices: Record<string, { name: string; price: number }> = {
  "BTC/USDT": { name: "Bitcoin", price: 43250.00 },
  "ETH/USDT": { name: "Ethereum", price: 2280.50 },
  "SOL/USDT": { name: "Solana", price: 98.75 },
  "BNB/USDT": { name: "BNB", price: 312.40 },
  "XRP/USDT": { name: "XRP", price: 0.6234 },
  "ADA/USDT": { name: "Cardano", price: 0.5890 },
  "DOGE/USDT": { name: "Dogecoin", price: 0.0892 },
  "DOT/USDT": { name: "Polkadot", price: 7.45 },
};

// Store current prices with some volatility
let currentPrices: Record<string, number> = {};

// Initialize prices
Object.entries(basePrices).forEach(([symbol, { price }]) => {
  currentPrices[symbol] = price;
});

// Add some volatility to prices
function updatePrices(): void {
  Object.keys(currentPrices).forEach((symbol) => {
    const volatility = 0.002; // 0.2% max change per update
    const change = (Math.random() - 0.5) * 2 * volatility;
    currentPrices[symbol] = currentPrices[symbol] * (1 + change);
  });
}

// Update prices every 5 seconds
setInterval(updatePrices, 5000);

export function getMarketPrices(): CryptoPrice[] {
  return Object.entries(basePrices).map(([symbol, { name }]) => {
    const currentPrice = currentPrices[symbol];
    const basePrice = basePrices[symbol].price;
    const change24h = ((currentPrice - basePrice) / basePrice) * 100 + (Math.random() - 0.5) * 5;
    
    return {
      symbol,
      name,
      price: currentPrice,
      change24h,
      volume24h: Math.random() * 10000000000 + 1000000000,
      marketCap: currentPrice * (Math.random() * 100000000 + 10000000),
      high24h: currentPrice * (1 + Math.random() * 0.05),
      low24h: currentPrice * (1 - Math.random() * 0.05),
    };
  });
}

export function getCurrentPrice(symbol: string): number {
  return currentPrices[symbol] || 0;
}

export function getChartData(symbol: string, timeframe: string = "1D"): ChartDataPoint[] {
  const basePrice = currentPrices[symbol] || 1000;
  const now = Date.now();
  const points: ChartDataPoint[] = [];
  
  let interval: number;
  let count: number;
  
  switch (timeframe) {
    case "1H":
      interval = 60 * 1000; // 1 minute
      count = 60;
      break;
    case "4H":
      interval = 5 * 60 * 1000; // 5 minutes
      count = 48;
      break;
    case "1W":
      interval = 4 * 60 * 60 * 1000; // 4 hours
      count = 42;
      break;
    case "1M":
      interval = 24 * 60 * 60 * 1000; // 1 day
      count = 30;
      break;
    default: // 1D
      interval = 30 * 60 * 1000; // 30 minutes
      count = 48;
  }
  
  let price = basePrice * 0.95; // Start 5% lower
  
  for (let i = count; i >= 0; i--) {
    const time = now - (i * interval);
    const volatility = 0.01;
    const trend = (count - i) / count * 0.05; // Slight upward trend
    
    const change = (Math.random() - 0.48) * volatility + trend * 0.001;
    price = price * (1 + change);
    
    const open = price;
    const close = price * (1 + (Math.random() - 0.5) * 0.005);
    const high = Math.max(open, close) * (1 + Math.random() * 0.003);
    const low = Math.min(open, close) * (1 - Math.random() * 0.003);
    
    points.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000 + 100000,
    });
  }
  
  return points;
}
