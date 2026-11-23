import { db, pool } from "./db";
import { networks, portfolios, stakingPositions, tradingSignals } from "@shared/schema";

const DEMO_USER_ID = "demo-user";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(tradingSignals);
  await db.delete(stakingPositions);
  await db.delete(portfolios);
  await db.delete(networks);

  // Seed networks
  const networkData = [
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

  await db.insert(networks).values(networkData);
  console.log("✓ Seeded networks");

  // Seed portfolios
  const portfolioData = [
    {
      userId: DEMO_USER_ID,
      networkId: "eth",
      tokenSymbol: "ETH",
      balance: "12.5",
      usdValue: "23456.78",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "eth",
      tokenSymbol: "USDT",
      balance: "5000",
      usdValue: "5000.00",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "bsc",
      tokenSymbol: "BNB",
      balance: "45.2",
      usdValue: "15234.56",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "bsc",
      tokenSymbol: "USDC",
      balance: "3000",
      usdValue: "3000.00",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "polygon",
      tokenSymbol: "MATIC",
      balance: "1234.5",
      usdValue: "7032.11",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "polygon",
      tokenSymbol: "USDT",
      balance: "2500",
      usdValue: "2500.00",
    },
  ];

  await db.insert(portfolios).values(portfolioData);
  console.log("✓ Seeded portfolios");

  // Seed staking positions
  const stakingData = [
    {
      userId: DEMO_USER_ID,
      networkId: "eth",
      amount: "5.0",
      apy: "4.5",
      rewardsEarned: "0.15",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "bsc",
      amount: "20.0",
      apy: "8.2",
      rewardsEarned: "0.95",
    },
    {
      userId: DEMO_USER_ID,
      networkId: "polygon",
      amount: "500.0",
      apy: "12.5",
      rewardsEarned: "35.80",
    },
  ];

  await db.insert(stakingPositions).values(stakingData);
  console.log("✓ Seeded staking positions");

  // Seed trading signals with sample data
  const signalData = [
    {
      symbol: "ETH/USDT",
      action: "buy",
      confidence: "87.5",
      targetPrice: "2450.00",
      reasoning: "Strong bullish momentum with high volume. RSI indicating oversold conditions. Historical support at $2400 level.",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      symbol: "BTC/USDT",
      action: "hold",
      confidence: "72.3",
      targetPrice: "42500.00",
      reasoning: "Consolidation phase detected. Wait for breakout above $43k resistance or entry below $41k support.",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      symbol: "MATIC/USDT",
      action: "sell",
      confidence: "65.8",
      targetPrice: "0.82",
      reasoning: "Overbought RSI with decreasing volume. Potential correction to $0.80 support level.",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      symbol: "BNB/USDT",
      action: "buy",
      confidence: "78.9",
      targetPrice: "365.00",
      reasoning: "Breaking above key resistance with strong volume. Target $365 with stop loss at $325.",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ];

  await db.insert(tradingSignals).values(signalData);
  console.log("✓ Seeded trading signals");

  console.log("✓ Database seeding complete!");
  await pool.end();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
